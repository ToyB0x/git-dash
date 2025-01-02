import { getR2Path } from "@git-dash/schema/path";
import { stat } from "@git-dash/schema/statFile";
import { vValidator } from "@hono/valibot-validator";
import { bodyLimit } from "hono/body-limit";
import { createFactory } from "hono/factory";
import * as v from "valibot";

const factory = createFactory<{
  Bindings: Env;
  Variables: {
    validWorkspaceId: string;
  };
}>();

const validator = vValidator(
  "form",
  v.object({
    reportId: v.string(),
    type: v.literal(stat.type),
    file: v.instance(File),
  }),
);

const handlers = factory.createHandlers(
  bodyLimit({ maxSize: 10 * 1024 * 1024 }), // 10 MB
  validator,
  async (c) => {
    const validated = c.req.valid("form");

    await c.env.REPORT_BUCKET.put(
      getR2Path({
        workspaceId: c.var.validWorkspaceId,
        reportId: validated.reportId,
      }),
      validated.file,
    );

    return c.json({ success: true });
  },
);

export const postHandler = handlers;
