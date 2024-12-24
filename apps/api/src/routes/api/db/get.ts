import { getFirebaseToken } from "@hono/firebase-auth";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  // const workspaceId = c.req.param("workspaceId");

  const idToken = getFirebaseToken(c);
  if (!idToken) throw Error("Unauthorized");

  // TODO: use dynamic workspaceId
  const obj = await c.env.REPORT_BUCKET.get(
    "workspaces/workspace1/reports/jG5iQAXiuwSS/types/$workspaceId.file/data.json",
  );

  if (!obj) throw Error("Not Found");

  return c.body(await obj.text());
});

export const getHandler = handlers;
