import { getDbClient, getOctokit } from "@/clients";
import type { Configs } from "@/env";
import { step } from "@/utils";
import { scanTbl } from "@g-dash/db-shared";
import { eq } from "drizzle-orm";
import { aggregate as aggregateAlert } from "./alert";
import { aggregate as aggregateCommit } from "./commit";
import { aggregate as aggregatePr } from "./pr";
import { aggregate as aggregateRelease } from "./release";
import { aggregate as aggregateRepositories } from "./repositories";
import { aggregate as aggregateReview } from "./review";
import { aggregate as aggregateTimeline } from "./timeline";
import { aggregate as aggregateUserFromPrAndReview } from "./user";
import { aggregate as aggregateWorkflow } from "./workflow";
import { aggregate as workflowUsageCurrentCycle } from "./workflow-usage-current-cycle";
import { aggregate as workflowUsageCurrentCycleOrg } from "./workflow-usage-current-cycle-org";

export const aggregateAll = async (configs: Configs): Promise<void> => {
  const octokit = await getOctokit(configs);
  const sharedDbClient = getDbClient(configs);

  const scan = await sharedDbClient
    .insert(scanTbl)
    .values({ createdAt: new Date(), updatedAt: new Date() })
    .returning();

  const scanId = scan[0]?.id;
  if (!scanId) throw new Error("Failed to create scan");

  // NOTE: リポジトリ数 / 100 のQuotaを消費 (100リポジトリあたり1回のリクエスト)
  const repositories = await step({
    configs,
    stepName: "aggregate:repository",
    callback: aggregateRepositories(octokit, sharedDbClient, configs),
  });

  if (configs.GDASH_MODE !== "PERSONAL") {
    await step({
      configs,
      stepName: "aggregate:alert",
      callback: aggregateAlert(scanId, sharedDbClient, octokit, configs),
    });
  }

  const maxOldForRepo = new Date(
    Date.now() -
      configs.GDASH_COLLECT_DAYS_LIGHT_TYPE_ITEMS /* days */ *
        60 *
        60 *
        24 *
        1000,
  ).getTime();

  const isTodaySunday = new Date().getDay() === 0;

  // NOTE: 通常は1月以内に更新されたリポジトリのみを対象にする(日曜だけは全リポジトリを対象にする)
  const filteredRepositories = repositories.filter(
    (repository) =>
      isTodaySunday ||
      (repository.updated_at &&
        new Date(repository.updated_at).getTime() > maxOldForRepo),
  );

  if (configs.GDASH_MODE !== "PERSONAL") {
    // NOTE: リポジトリ数に応じてQuotaを消費
    await step({
      configs,
      stepName: "aggregate:release",
      callback: aggregateRelease(
        filteredRepositories,
        sharedDbClient,
        octokit,
        configs,
      ),
    });
  }

  if (configs.GDASH_MODE !== "PERSONAL") {
    // NOTE: リポジトリ数に応じてQuotaを消費
    await step({
      configs,
      stepName: "aggregate:workflow",
      callback: aggregateWorkflow(
        filteredRepositories,
        sharedDbClient,
        octokit,
        configs,
      ),
    });
  }

  // // NOTE: Workflowの実行数に応じてQuotaを消費
  // await step({
  //   stepName: "aggregate:workflow-run-and-each-run-cost",
  //   callback: aggregateWorkflowRunAndEachRunCost(filteredRepositories),
  // });

  if (configs.GDASH_MODE !== "PERSONAL") {
    // NOTE: Workflow fileの数に応じてQuotaを消費
    await step({
      configs,
      stepName: "aggregate:workflow-usage-current-cycle",
      callback: workflowUsageCurrentCycle(
        scanId,
        sharedDbClient,
        octokit,
        configs,
      ),
    });
  }

  if (configs.GDASH_MODE !== "PERSONAL") {
    // costは1のみ
    await step({
      configs,
      stepName: "aggregate:usage-current-cycle-org",
      callback: workflowUsageCurrentCycleOrg(
        scanId,
        sharedDbClient,
        octokit,
        configs,
      ),
    });
  }

  // NOTE: リポジトリ数に応じてQuotaを消費 + PRが多い場合はリポジトリ毎のページング分のQuotaを消費 (300 Repo + 2 paging = 600 Points)
  await step({
    configs,
    stepName: "aggregate:pr",
    callback: aggregatePr(
      filteredRepositories,
      sharedDbClient,
      octokit,
      configs,
    ),
  });

  // NOTE: リポジトリ数に応じてQuotaを消費 + Reviewが多い場合はリポジトリ毎のページング分のQuotaを消費 (300 Repo + 2 paging = 600 Points)
  await step({
    configs,
    stepName: "aggregate:review",
    callback: aggregateReview(
      filteredRepositories,
      sharedDbClient,
      octokit,
      configs,
    ),
  });

  // NOTE: リポジトリ数に応じてQuotaを消費 + Reviewが多い場合はリポジトリ毎のページング分のQuotaを消費 (300 Repo + 2 paging = 600 Points)
  await step({
    configs,
    stepName: "aggregate:timeline",
    callback: aggregateTimeline(sharedDbClient, octokit, configs),
  });

  await step({
    configs,
    stepName: "aggregate:commit",
    callback: aggregateCommit(sharedDbClient, octokit, configs),
  });

  await step({
    configs,
    stepName: "aggregate:user-from-pr-and-review",
    callback: aggregateUserFromPrAndReview(sharedDbClient, octokit),
  });

  await sharedDbClient
    .update(scanTbl)
    .set({ updatedAt: new Date() })
    .where(eq(scanTbl.id, scanId));
};

// NOTE: Quota節約のコツ
// - 診断対象の日数を絞る
// - 古いWorkflowの詳細を毎回取得しない(過去に取得したデータを使い回す)
// - 同じくリポジトリ数に比例してリクエストが増えるデータは過去に取得したデータを有効活用する
// - 内部的にContinue機能を実装する(Quotaを使い切ってしまっても、前回取得文を有効活用して、次の診断の負荷を減らす)
//   --> SQLiteを大雑把に使っているため、頻繁にDB全体の破棄が発生しうるので、データの自動での再取得処理は必ず必要
//   --> 所定の日数分を取得してもQuotaに余裕がある場合は遡って実行できるようにすると良さそう(Scan項目毎に、前回終了した日時や、対象ID等を保存しておく)
