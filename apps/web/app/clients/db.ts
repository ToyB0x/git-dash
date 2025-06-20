import { hc } from "@/clients/hono";
import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";

export const getWasmDb = async ({
  workspaceId,
  firebaseToken,
}: {
  workspaceId: string;
  firebaseToken: string | null;
}) => {
  const sqlPromise = initSqlJs({
    // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
    // You can omit locateFile completely when running in node

    // workaround for sql.js latest version brake app
    // ref: https://github.com/sql-js/sql.js/issues/605#issuecomment-2727051917
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`,
  });

  if (!firebaseToken) {
    console.warn("firebaseToken is null");
    return null;
  }

  const dbResponsePromise = hc.api.db[":workspaceId"].$get(
    {
      param: { workspaceId },
    },
    {
      headers: { Authorization: `Bearer ${firebaseToken}` },
    },
  );

  const [sql, dbResponse] = await Promise.all([sqlPromise, dbResponsePromise]);

  if (!dbResponse.ok) {
    alert((await dbResponse.json()).message);
    return null;
  }

  const sqldb = new sql.Database(
    new Uint8Array(await unGzip(await dbResponse.arrayBuffer())),
  );
  return drizzle(sqldb);
};

const unGzip = async (buffer: ArrayBuffer) => {
  const decompressedStream = new Blob([buffer])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return await new Response(decompressedStream).arrayBuffer();
};
