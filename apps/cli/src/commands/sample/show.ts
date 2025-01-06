import process from "node:process";
import { styleText } from "node:util";
import { getDbClient } from "@/clients";
import { readConfigs } from "@/env";
import { prTbl, reviewTbl, userTbl } from "@git-dash/db";
import { input } from "@inquirer/prompts";
import Table from "cli-table";
import { eq } from "drizzle-orm";

export const showCommand = async () => {
  const targetGithubOrg = await input({
    message: "Enter target github organization name",
  });

  const configs = readConfigs({
    GDASH_MODE: "SAMPLE",
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

  const results = prs.sort((a, b) => b.countPR - a.countPR);

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
Please use our web site. It's free! (https://v0.git-dash.com/sample-[very-long-secure-random-id]/overview)

You can check time to review, time to merge, etc...
(Remember, PR volume is not the only important metric,
 you need to get insights from multiple aspects.)
==============================================================`,
    ),
  );
};
