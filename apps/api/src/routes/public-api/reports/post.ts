import { vValidator } from "@hono/valibot-validator";
import { getR2Path } from "@repo/schema/path";
import { stat as statCost } from "@repo/schema/statCost";
import { stat as statMerged } from "@repo/schema/statMerged";
import { stat as statRepositories } from "@repo/schema/statRepositories";
import { stat as statReviews } from "@repo/schema/statReviews";
import { stat as statWaitingReviews } from "@repo/schema/statWaitingReviews";
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
  "json",
  v.variant("type", [
    statMerged.schema,
    statReviews.schema,
    statWaitingReviews.schema,
    statRepositories.schema,
    statCost.schema,
  ]),
);

const handlers = factory.createHandlers(
  bodyLimit({ maxSize: 500 * 1024 }), // 500kb
  validator,
  async (c) => {
    const validated = c.req.valid("json");

    await c.env.REPORT_BUCKET.put(
      getR2Path({
        workspaceId: c.var.validWorkspaceId,
        reportId: validated.reportId,
        type: validated.type,
      }),
      JSON.stringify(validated),
    );

    return c.json({ success: true });
  },
);

export const postHandler = handlers;
