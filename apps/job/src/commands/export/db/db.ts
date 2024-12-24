import { readFile } from "node:fs/promises";
import { hc } from "@/clients";
import { env } from "@/env";
import { type Schema, stat } from "@repo/schema/statFile";

export const db = async ({
  reportId,
}: {
  reportId: string;
}) => {
  const file = await readFile("../../packages/db-job/sqlite/job.db");

  const json = {
    reportId,
    type: stat.type,
    version: stat.version,
    stats: {
      data: file.toString("base64"),
    },
  } satisfies Schema;

  await hc["public-api"].db[":workspaceId"].$post({
    json,
    param: { workspaceId: env.GDASH_WORKSPACE_ID },
  });
};
