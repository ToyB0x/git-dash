import { generateNewReportId, reportTbl } from "@git-dash/db-api/schema";
import { vValidator } from "@hono/valibot-validator";
import { drizzle } from "drizzle-orm/d1";
import { bodyLimit } from "hono/body-limit";
import { createFactory } from "hono/factory";
import * as v from "valibot";
import { getR2Path } from "../../../constants";
import { HttpStatusCode } from "../../../types";

const factory = createFactory<{
  Bindings: Env;
  Variables: {
    validWorkspaceId: string;
  };
}>();

const validator = vValidator(
  "form",
  v.object({
    file: v.instance(File),
  }),
);

const handlers = factory.createHandlers(
  bodyLimit({ maxSize: 5 * 1024 * 1024 }), // 5 MB
  validator,
  async (c) => {
    const validated = c.req.valid("form");

    const db = drizzle(c.env.DB_API);
    const result = await db
      .insert(reportTbl)
      .values({
        id: generateNewReportId(),
        workspaceId: c.var.validWorkspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const returnData = result[0];

    if (!returnData) {
      return c.json(
        {
          message: "Failed to create report",
        },
        HttpStatusCode.INTERNAL_SERVER_ERROR_500,
      );
    }

    await c.env.BUCKET_DB_REPORT.put(
      getR2Path({ workspaceId: c.var.validWorkspaceId }),
      validated.file,
    );

    return c.json({ success: true });
  },
);

export const postHandler = handlers;
