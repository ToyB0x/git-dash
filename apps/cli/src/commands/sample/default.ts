import process from "node:process";
import { styleText } from "node:util";
import { getDbClient, getOctokit } from "@/clients";
import { aggregate as aggregateCommit } from "@/commands/aggregate/commit";
import { aggregate as aggregatePr } from "@/commands/aggregate/pr";
import { aggregate as aggregateRepositories } from "@/commands/aggregate/repositories";
import { aggregate as aggregateReview } from "@/commands/aggregate/review";
import { aggregate as aggregateTimeline } from "@/commands/aggregate/timeline";
import { aggregate as aggregateUserFromPrAndReview } from "@/commands/aggregate/user";
import { readConfigs } from "@/env";
import { logger, step } from "@/utils";
import { prTbl, scanTbl } from "@git-dash/db";
import { confirm, input, number } from "@inquirer/prompts";
import { subDays } from "date-fns";
import { eq } from "drizzle-orm";

export const defaultCommand = async () => {
  const ghCommandSetupStatus = await confirm({
    message:
      "Did you already install Github CLI and set it up? (already run gh login ?)",
  });

  if (!ghCommandSetupStatus) {
    console.error(
      styleText("red", "Please install Github CLI and set it up first."),
    );
    process.exit(1);
  }

  const targetGithubOrg = await input({
    message: "Enter target github organization name",
  });

  const configs = readConfigs({
    GDASH_MODE: "PERSONAL_SAMPLE",
    env: {
      ...process.env,
      GDASH_ENV: "dev",
      GDASH_GITHUB_ORGANIZATION_NAME: targetGithubOrg,
    },
  });

  // TODO: いきなり全部は診断せずに、まずはリポジトリ数のみ　first search した上で、必要に応じてユーザに確認した上でリポジトリの絞り込みを行う
  // (さらに細かいコミットグラフを取得するかを追加のsecond searchで確認する)

  const octokit = await getOctokit(configs);
  const sharedDbClient = getDbClient(configs);

  const scan = await sharedDbClient
    .insert(scanTbl)
    .values({ createdAt: new Date(), updatedAt: new Date() })
    .returning();

  const scanId = scan[0]?.id;
  if (!scanId) throw new Error("Failed to create scan");

  const repoDaysAgo = await number({
    message: `How many days ago do you want to target repositories that have had pushes ?
      (default: 7 days)`,
    min: 1,
    max: 180,
    default: 7,
    required: true,
  });

  if (!repoDaysAgo) throw Error("Failed to get repoDaysAgo");

  const repositories = await step({
    configs,
    stepName: "aggregate:repository",
    callback: aggregateRepositories(
      octokit,
      sharedDbClient,
      configs,
      subDays(new Date(), repoDaysAgo),
    ),
  });

  const repoCount = await number({
    message: `${repositories.length} repository found in specified days. Do you want analysis all repo ?
      (default: yes, if you specify Number, this will analyze most recent Number repo.)`,
    min: 1,
    max: repositories.length,
    default: repositories.length,
    required: true,
  });

  if (!repoCount) throw Error("Failed to get repoDaysAgo");
  const filteredRepos = repositories.slice(0, repoCount);

  // NOTE: リポジトリ数に応じてQuotaを消費 + PRが多い場合はリポジトリ毎のページング分のQuotaを消費 (300 Repo + 2 paging = 600 Points)
  await step({
    configs,
    stepName: "aggregate:pr",
    callback: aggregatePr(filteredRepos, sharedDbClient, octokit, configs),
  });

  // NOTE: リポジトリ数に応じてQuotaを消費 + Reviewが多い場合はリポジトリ毎のページング分のQuotaを消費 (300 Repo + 2 paging = 600 Points)
  await step({
    configs,
    stepName: "aggregate:review",
    callback: aggregateReview(filteredRepos, sharedDbClient, octokit, configs),
  });

  const addvanceAggregateAnswer = await confirm({
    message: `PR and Review aggregation is complete. Do you want to continue with the advanced aggregation ?
      (This will consume more API quota and take more time, but will provide more detailed analysis like commit and review heatmaps)`,
  });

  const prs = await sharedDbClient.select().from(prTbl);

  const heatmapDaysAgo = await number({
    message: `How many days ago do you want to get commit and review heatmaps ?
      (default: 14 days, if you specify 60 days, this need approximately ${prs.length * 1.5} quota )`,
    min: 1,
    max: 60,
    default: 14,
    required: true,
  });

  if (!addvanceAggregateAnswer) {
    logger.info("done! 🎉🎉🎉");
    return;
  }

  // NOTE: リポジトリ数に応じてQuotaを消費 + Reviewが多い場合はリポジトリ毎のページング分のQuotaを消費 (300 Repo + 2 paging = 600 Points)
  await step({
    configs,
    stepName: "aggregate:timeline",
    callback: aggregateTimeline(
      sharedDbClient,
      octokit,
      configs,
      heatmapDaysAgo,
    ),
  });

  await step({
    configs,
    stepName: "aggregate:commit",
    callback: aggregateCommit(sharedDbClient, octokit, configs, heatmapDaysAgo),
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

  logger.info("done! 🎉🎉🎉");
};
