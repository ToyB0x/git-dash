import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
  return c.text("Hello Hono! deployed by github actions");
});

app.get("/report", async (c) => {
  const res = await c.env.REPORT_BUCKET.put(
    "key-1",
    JSON.stringify({ key1: "value-1" }),
  );
  console.info(res);
  return c.text("ok");
});

export default app;
