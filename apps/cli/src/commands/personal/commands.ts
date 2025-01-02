import process from "node:process";
import { styleText } from "node:util";
import { getDbClient } from "@/clients";
import { aggregateAll } from "@/commands/aggregate/aggregate";
import { readConfigs } from "@/env";
import { logger } from "@/utils";
import { confirm, input } from "@inquirer/prompts";
import { prTbl, reviewTbl, userTbl } from "@repo/db-shared";
import Table from "cli-table";
import { Command } from "commander";
import { eq } from "drizzle-orm";

export const newPersonalCommand = () => {
  const personalCmd = new Command("personal");
  personalCmd.description("personal mode related commands.");

  personalCmd
    .command("*", { isDefault: true })
    .description("aggregate with personal mode")
    .action(async () => {
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

      await aggregateAll(configs);

      logger.info("done! 🎉🎉🎉");
    });

  personalCmd
    .command("show")
    .description("show personal mode aggregated result")
    .action(async () => {
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

      const shardDb = getDbClient(configs);
      const prs = await shardDb
        .select({
          login: userTbl.login,
          countPR: shardDb.$count(prTbl, eq(userTbl.id, prTbl.authorId)),
          countReview: shardDb.$count(
            reviewTbl,
            eq(userTbl.id, reviewTbl.reviewerId),
          ),
        })
        .from(userTbl);
      // .leftJoin(prTbl, eq(userTbl.id, prTbl.authorId));

      const results = prs.sort((a, b) => b.countPR - a.countPR);

      // instantiate
      const table = new Table({
        head: ["Ranking", "User", "PR count", "Review count"],
      });
      table.push(
        ...results.map((r, i) => [
          i < 10 ? `${i + 1} ⭐` : (i + 1).toString(),
          r.login,
          r.countPR.toString(),
          r.countReview.toString(),
        ]),
      );

      console.log(table.toString());

      console.log(
        styleText(
          "redBright",
          `==============================================================
NOTICE: This is a just "sample" command.
If you want to see more detailed data from various aspect,
Please use our web site. It's free! (https://v0.git-dash.com)
(You can check time to review, time to merge, etc...)
==============================================================`,
        ),
      );
    });

  return personalCmd;
};
