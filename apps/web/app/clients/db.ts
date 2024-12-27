import { hc } from "@/clients/hono";
import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";

export const getWasmDb = async ({
  workspaceId,
  firebaseToken,
}: {
  workspaceId: string;
  firebaseToken: string;
}) => {
  const dbResponse = await hc.api.db[":workspaceId"].$get(
    {
      param: { workspaceId },
    },
    {
      headers: { Authorization: `Bearer ${firebaseToken}` },
    },
  );

  if (!dbResponse.ok) {
    return null;
  }

  const sqlPromise = await initSqlJs({
    // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
    // You can omit locateFile completely when running in node
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  const sqldb = new sqlPromise.Database(
    new Uint8Array(await dbResponse.arrayBuffer()),
  );
  return drizzle(sqldb);
};
