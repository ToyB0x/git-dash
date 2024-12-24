import { vValidator } from "@hono/valibot-validator";
import { getR2Path } from "@repo/schema/path";
import { stat } from "@repo/schema/statFile";
import { bodyLimit } from "hono/body-limit";
import { createFactory } from "hono/factory";
import * as v from "valibot";

const factory = createFactory<{
  Bindings: Env;
  Variables: {
    validWorkspaceId: string;
  };
}>();

const validator = vValidator("json", v.variant("type", [stat.schema]));

const handlers = factory.createHandlers(
  bodyLimit({ maxSize: 5 * 1024 * 1024 }), // 5 MB
  validator,
  async (c) => {
    const validated = c.req.valid("json");

    await c.env.REPORT_BUCKET.put(
      getR2Path({
        workspaceId: c.var.validWorkspaceId,
        reportId: validated.reportId,
        type: validated.type,
      }),
      validated.stats.data,
    );

    return c.json({ success: true });
  },
);

export const postHandler = handlers;
