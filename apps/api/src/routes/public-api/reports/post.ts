import { vValidator } from "@hono/valibot-validator";
import { getR2Path } from "@repo/schema/path";
import { statMerged } from "@repo/schema/statMerged";
import { bodyLimit } from "hono/body-limit";
import { createFactory } from "hono/factory";

const factory = createFactory<{
  Bindings: Env;
  Variables: {
    validGroupId: string;
  };
}>();

const validator = vValidator("json", statMerged.schema);

const handlers = factory.createHandlers(
  bodyLimit({ maxSize: 500 * 1024 }), // 500kb
  validator,
  async (c) => {
    const validated = c.req.valid("json");

    await c.env.REPORT_BUCKET.put(
      getR2Path({
        groupId: c.var.validGroupId,
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
