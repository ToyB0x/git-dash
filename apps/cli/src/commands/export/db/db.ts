import { readFile } from "node:fs/promises";
import { getDbClient, getDbPath, type getHonoClient } from "@/clients";
import type { Configs } from "@/env";
import { sql } from "drizzle-orm";

export const db = async ({
  honoClient,
  configs,
}: {
  honoClient: ReturnType<typeof getHonoClient>;
  configs: Configs;
}) => {
  // VACUUM is used to rebuild the database file, it is used to optimize the database file
  const sharedDbClient = getDbClient(configs);
  await sharedDbClient.run(sql`VACUUM;`);

  const file = await readFile(getDbPath(configs));
  const gziped = await gzip(file);

  await honoClient["public-api"].db.$post({
    form: {
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
