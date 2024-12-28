import { readFile } from "node:fs/promises";
import { filePath, hc } from "@/clients";
import { stat } from "@repo/schema/statFile";

export const db = async ({
  reportId,
}: {
  reportId: string;
}) => {
  const file = await readFile(filePath);
  const gziped = await gzip(file);

  await hc["public-api"].db.$post({
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
