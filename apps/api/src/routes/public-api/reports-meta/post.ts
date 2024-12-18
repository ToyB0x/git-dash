import { generateNewReportId, reportTbl } from "@repo/db-api/schema";
import { drizzle } from "drizzle-orm/d1";
import { bodyLimit } from "hono/body-limit";
import { createFactory } from "hono/factory";

const factory = createFactory<{
  Bindings: Env;
  Variables: {
    validGorkspaceId: string;
  };
}>();

const handlers = factory.createHandlers(
  bodyLimit({ maxSize: 1024 }), // １kb
  async (c) => {
    const db = drizzle(c.env.DB_API);
    const result = await db
      .insert(reportTbl)
      .values({
        id: generateNewReportId(),
        workspaceId: c.var.validGorkspaceId,
        status: "RUNNING",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const returnData = result[0];

    if (!returnData) {
      throw new Error("Failed to create report");
    }

    return c.json(returnData);
  },
);

export const postHandler = handlers;
