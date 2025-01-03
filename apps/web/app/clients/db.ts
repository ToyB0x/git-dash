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
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  const dbResponsePromise = firebaseToken
    ? hc.api.db[":workspaceId"].$get(
        {
          param: { workspaceId },
        },
        {
          headers: { Authorization: `Bearer ${firebaseToken}` },
        },
      )
    : hc["sample-api"].db[":sampleWorkspaceId"].$get({
        param: { sampleWorkspaceId: workspaceId },
      });

  const [sql, dbResponse] = await Promise.all([sqlPromise, dbResponsePromise]);

  if (!dbResponse.ok) {
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
