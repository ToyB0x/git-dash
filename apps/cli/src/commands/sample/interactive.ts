import process from "node:process";
import { styleText } from "node:util";
import { getDbClient, getHonoClient, getOctokit } from "@/clients";
import { aggregate as aggregatePr } from "@/commands/aggregate/pr";
import { aggregate as aggregateRepositories } from "@/commands/aggregate/repositories";
import { aggregate as aggregateReview } from "@/commands/aggregate/review";
import { aggregate as aggregateUserFromPrAndReview } from "@/commands/aggregate/user";
import { readConfigs } from "@/env";
import { exportDbFile, logger, step } from "@/utils";
import { scanTbl } from "@git-dash/db";
import { checkbox, confirm, input, number } from "@inquirer/prompts";
import { subDays } from "date-fns";
import { eq } from "drizzle-orm";

export const interactiveCommand = async () => {
  logger.level = "silent";

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

  const githubOrg = await input({
    message: "Enter Github organization name you want to check",
  });

  const configs = readConfigs({
    GDASH_MODE: "SAMPLE",
    env: {
      // GDASH_ENVが明示されていなければPrdと見なす
      GDASH_ENV: "prd",
      ...process.env, // GDASH_ENV は env で上書きされる
      GDASH_GITHUB_ORGANIZATION_NAME: githubOrg,
    },
  });

  const octokit = await getOctokit(configs);
  const sharedDbClient = getDbClient(configs);

  const scan = await sharedDbClient
    .insert(scanTbl)
    .values({ createdAt: new Date(), updatedAt: new Date() })
    .returning();

  const scanId = scan[0]?.id;
  if (!scanId) throw new Error("Failed to create scan");

  console.log(
    "\nScanning the organization",
    githubOrg,
    ", this take few minutes, please wait...\n",
  );

  const repositories = await step({
    configs,
    stepName: "aggregate:repository",
    callback: aggregateRepositories(
      octokit,
      sharedDbClient,
      configs,
      subDays(new Date(), 360),
    ),
  });

  console.log(
    `Found ${repositories.length} repositories in the last 360 days\n`,
  );

  const targetRepositories = await checkbox({
    message: "Select repositories you want to check\n",
    choices: repositories
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((r) => ({
        name: r.name,
        value: r,
        checked: true,
      })),
  });

  const scanDays = await number({
    message: "How many days do you want to scan ? (max 60 days)",
    min: 1,
    max: 60,
    default: 30,
    required: true,
  });

  if (typeof scanDays !== "number") throw Error("scanDays is not a number");

  console.log(
    "\nScanning repositories.",
    "This take few minutes, please wait...\n",
  );

  await step({
    configs,
    stepName: "aggregate:pr",
    callback: aggregatePr(
      targetRepositories,
      sharedDbClient,
      octokit,
      configs,
      subDays(new Date(), scanDays),
    ),
  });

  await step({
    configs,
    stepName: "aggregate:review",
    callback: aggregateReview(
      targetRepositories,
      sharedDbClient,
      octokit,
      configs,
      subDays(new Date(), scanDays),
    ),
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

  const hc = getHonoClient(configs);

  const file = await exportDbFile({ dbClient: sharedDbClient, configs });

  const res = await hc["sample-api"].db.$post({
    form: {
      file: file,
    },
  });

  const points = await octokit.rest.rateLimit.get();

  const result = await res.json();

  console.info(
    styleText(
      "blue",
      `
All steps complete 🎉
(You have ${points.data.rate.remaining} points remaining)

Let's check result in sample page!,
(this url expires in 1 hour),

https://v0.git-dash.com/sample-${result.sampleWorkspaceId}/users
`,
    ),
  );
};
