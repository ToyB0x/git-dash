import fs from "node:fs";
import { getDbPath, getHonoClient } from "@/clients";
import type { Configs } from "@/env";
import { logger } from "@/utils";

export const download = async (configs: Configs) => {
  const hc = getHonoClient(configs);
  const filePath = getDbPath(configs);

  logger.info("Downloading database file");
  const res = await hc["public-api"].db.$get();

  if (!res.ok) {
    logger.warn("Failed to download database, creating a new database file");
    return;
  }

  const file = await unGzip(await res.arrayBuffer());
  fs.writeFileSync(filePath, Buffer.from(file));
  logger.info("Database file updated");
};

const unGzip = async (buffer: ArrayBuffer) => {
  const decompressedStream = new Blob([buffer])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return await new Response(decompressedStream).arrayBuffer();
};
