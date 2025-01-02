import { readFile } from "node:fs/promises";
import { type getDbClient, getDbPath } from "@/clients";
import type { Configs } from "@/env";
import { logger } from "@/utils";
import { sql } from "drizzle-orm";

export const exportDbFile = async ({
  dbClient,
  configs,
}: {
  dbClient: ReturnType<typeof getDbClient>;
  configs: Configs;
}): Promise<File> => {
  dbClient.run(sql`VACUUM;`);

  const file = await readFile(getDbPath(configs));
  const gziped = await gzip(file);

  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (gziped.byteLength > maxSize) {
    logger.warn(`Database file gzipped size: ${gziped.byteLength} bytes`);
    throw Error(
      "Database file gzipped size is too large. max size is 5MB. Please reduce the size of the database file.",
    );
  }

  return new File([gziped], "sqlite.db.gz");
};

const gzip = async (buf: Buffer) => {
  const readableStream = new Blob([buf]).stream();
  const compressedStream = readableStream.pipeThrough(
    new CompressionStream("gzip"),
  );
  return await new Response(compressedStream).arrayBuffer();
};
