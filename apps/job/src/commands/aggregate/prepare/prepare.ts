import fs from "node:fs";
import { filePath, hc } from "@/clients";
import { logger } from "@/utils";

export const prepare = async () => {
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
