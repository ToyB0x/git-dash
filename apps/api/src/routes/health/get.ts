import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory();

const handlers = factory.createHandlers(async (c) => {
  const db = drizzle(c.env.DB_API);
  await db.run(sql`select 1`);

  return c.json({ ok: true });
});

export const getHandler = handlers;
