import { readFile } from "node:fs/promises";
import { hc } from "@/clients";
import { env } from "@/env";
import { stat } from "@repo/schema/statFile";

export const db = async ({
  reportId,
}: {
  reportId: string;
}) => {
  const file = await readFile("../../packages/db-shared/sqlite/shared.db");
  const gziped = await gzip(file);

  await hc["public-api"].db[":workspaceId"].$post({
    param: { workspaceId: env.GDASH_WORKSPACE_ID },
    form: {
      reportId,
      type: stat.type,
      file: new File([gziped], "sqlite.db.gz"),
    },
  });
};

const gzip = async (buf: Buffer) => {
  const readableStream = new Blob([buf]).stream();
  const compressedStream = readableStream.pipeThrough(
    new CompressionStream("gzip"),
  );
  return await new Response(compressedStream).arrayBuffer();
};
