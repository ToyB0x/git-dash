import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  return c.json({ success: true });
});

export const postHandler = handlers;

// NOTE: You can test this route by running the following  command:
// curl -XPOST -H 'X-GDASH-GROUP-ID: xxxxx' -H 'X-GDASH-GROUP-API-KEY: xxxxx' 'http://localhost:8787/public-api/test'
