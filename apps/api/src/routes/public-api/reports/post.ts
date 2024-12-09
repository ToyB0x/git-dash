import { vValidator } from "@hono/valibot-validator";
import { getR2Path } from "@repo/schema/path";
import { statMerged } from "@repo/schema/statMerged";
import { bodyLimit } from "hono/body-limit";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const validator = vValidator("json", statMerged.schema);

const handlers = factory.createHandlers(
  bodyLimit({ maxSize: 500 * 1024 }), // 500kb
  validator,
  async (c) => {
    // TODO: Implement your business logic here
    // - authenticated user
    // - extract groupId and other params from request
    // - store r2 meta data to db

    const validated = c.req.valid("json");

    await c.env.REPORT_BUCKET.put(
      getR2Path({
        groupId: validated.groupId,
        reportId: validated.reportId,
        type: validated.type,
        version: validated.version,
      }),
      JSON.stringify(validated),
    );

    return c.json({ success: true });
  },
);

export const postHandler = handlers;
