import { step } from "@/utils";
import { aggregate as aggregatePr } from "./pr";
import { aggregate as aggregateRepositories } from "./repositories";
import { aggregate as aggregateReview } from "./review";
import { aggregate as aggregateUserFromPrAndReview } from "./user";
import { aggregate as aggregateWorkflow } from "./workflow";
import { aggregate as aggregateWorkflowRunAndEachRunCost } from "./workflow-run";
import { aggregate as workflowUsageCurrentCycle } from "./workflow-usage-current-cycle";
import { aggregate as workflowUsageCurrentCycleActionsBilling } from "./workflow-usage-current-cycle-by-runner";

const maxOldForRepo = new Date(
  Date.now() - 1 /* month */ * 60 * 60 * 24 * 30 * 1000,
).getTime();

const isTodaySunday = new Date().getDay() === 0;

export const aggregateByOrganization = async (): Promise<void> => {
  // NOTE: リポジトリ数 / 100 のQuotaを消費 (100リポジトリあたり1回のリクエスト)
  const repositories = await step({
    stepName: "aggregate:repository",
    callback: aggregateRepositories(),
  });

  // NOTE: 通常は1月以内に更新されたリポジトリのみを対象にする(日曜だけは全リポジトリを対象にする)
  const filteredRepositories = repositories.filter(
    (repository) =>
      isTodaySunday ||
      (repository.updated_at &&
        new Date(repository.updated_at).getTime() > maxOldForRepo),
  );

  // NOTE: リポジトリ数に応じてQuotaを消費
  await step({
    stepName: "aggregate:workflow",
    callback: aggregateWorkflow(filteredRepositories),
  });

  // NOTE: Workflowの実行数に応じてQuotaを消費
  await step({
    stepName: "aggregate:workflow-run-and-each-run-cost",
    callback: aggregateWorkflowRunAndEachRunCost(filteredRepositories),
  });

  // NOTE: Workflow fileの数に応じてQuotaを消費
  await step({
    stepName: "aggregate:workflow-usage-current-cycle",
    callback: workflowUsageCurrentCycle(),
  });

  // costは1のみ
  await step({
    stepName: "aggregate:usage-current-cycle-actions-billing",
    callback: workflowUsageCurrentCycleActionsBilling(),
  });

  // NOTE: リポジトリ数に応じてQuotaを消費 + PRが多い場合はリポジトリ毎のページング分のQuotaを消費 (300 Repo + 2 paging = 600 Points)
  await step({
    stepName: "aggregate:pr",
    callback: aggregatePr(filteredRepositories),
  });

  // NOTE: リポジトリ数に応じてQuotaを消費 + Reviewが多い場合はリポジトリ毎のページング分のQuotaを消費 (300 Repo + 2 paging = 600 Points)
  await step({
    stepName: "aggregate:review",
    callback: aggregateReview(filteredRepositories),
  });

  await step({
    stepName: "aggregate:user-from-pr-and-review",
    callback: aggregateUserFromPrAndReview(),
  });
};

// NOTE: Quota節約のコツ
// - 診断対象の日数を絞る
// - 古いWorkflowの詳細を毎回取得しない(過去に取得したデータを使い回す)
// - 同じくリポジトリ数に比例してリクエストが増えるデータは過去に取得したデータを有効活用する
// - 内部的にContinue機能を実装する(Quotaを使い切ってしまっても、前回取得文を有効活用して、次の診断の負荷を減らす)
//   --> SQLiteを大雑把に使っているため、頻繁にDB全体の破棄が発生しうるので、データの自動での再取得処理は必ず必要
//   --> 所定の日数分を取得してもQuotaに余裕がある場合は遡って実行できるようにすると良さそう(Scan項目毎に、前回終了した日時や、対象ID等を保存しておく)
