import { readFile } from "node:fs/promises";
import { getDbClient, getDbPath, type getHonoClient } from "@/clients";
import type { Configs } from "@/env";
import { stat } from "@repo/schema/statFile";
import { sql } from "drizzle-orm";

export const db = async ({
  honoClient,
  reportId,
  configs,
}: {
  honoClient: ReturnType<typeof getHonoClient>;
  reportId: string;
  configs: Configs;
}) => {
  // VACUUM is used to rebuild the database file, it is used to optimize the database file
  const sharedDbClient = getDbClient(configs);
  await sharedDbClient.run(sql`VACUUM;`);

  const file = await readFile(getDbPath(configs));
  const gziped = await gzip(file);

  await honoClient["public-api"].db.$post({
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
