import { vValidator } from "@hono/valibot-validator";
import { reportTbl } from "@repo/db-api/schema";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { bodyLimit } from "hono/body-limit";
import { createFactory } from "hono/factory";
import * as v from "valibot";

const factory = createFactory<{
  Bindings: Env;
  Variables: {
    validGorkspaceId: string;
  };
}>();

const status = ["RUNNING", "FINISHED", "ABORTED", "FAILED"] as const;

const validator = vValidator(
  "json",
  v.object({
    reportId: v.string(),
    workspaceId: v.string(),
    status: v.picklist(status),
  }),
);

const handlers = factory.createHandlers(
  bodyLimit({ maxSize: 1024 }), // 1kb
  validator,
  async (c) => {
    const validated = c.req.valid("json");

    const db = drizzle(c.env.DB_API);
    await db
      .update(reportTbl)
      .set({
        status: validated.status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(reportTbl.id, validated.reportId),
          eq(reportTbl.workspaceId, c.var.validGorkspaceId),
        ),
      );

    return c.json({ success: true });
  },
);

export const patchHandler = handlers;
