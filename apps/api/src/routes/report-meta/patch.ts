import { vValidator } from "@hono/valibot-validator";
import { reportTbl } from "@repo/db-api/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { bodyLimit } from "hono/body-limit";
import { createFactory } from "hono/factory";
import * as v from "valibot";

const factory = createFactory<{ Bindings: Env }>();

const status = ["RUNNING", "FINISHED", "ABORTED", "FAILED"] as const;

const validator = vValidator(
  "json",
  v.object({
    reportPublicId: v.string(),
    teamId: v.pipe(v.string(), v.uuid()),
    status: v.picklist(status),
  }),
);

const handlers = factory.createHandlers(
  bodyLimit({ maxSize: 1024 }), // 1kb
  validator,
  async (c) => {
    // TODO: Implement your business logic here
    // - authenticated user
    // - extract teamId and other params from request
    const validated = c.req.valid("json");

    const db = drizzle(c.env.DB_API);
    await db
      .update(reportTbl)
      .set({
        status: validated.status,
        updatedAt: new Date(),
      })
      .where(eq(reportTbl.publicId, validated.reportPublicId));

    return c.json({ success: true });
  },
);

export const patchHandler = handlers;
