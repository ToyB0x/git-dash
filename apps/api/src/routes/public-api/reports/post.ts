import { getR2Path } from "@git-dash/schema/path";
import { stat as statActionUsageCurrentCycle } from "@git-dash/schema/statActionUsageCurrentCycle";
import { stat as statCost } from "@git-dash/schema/statCost";
import { stat as statCosts } from "@git-dash/schema/statCosts";
import { stat as statMerged } from "@git-dash/schema/statMerged";
import { stat as statRepositories } from "@git-dash/schema/statRepositories";
import { stat as statReviews } from "@git-dash/schema/statReviews";
import { stat as statWaitingReviews } from "@git-dash/schema/statWaitingReviews";
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
  "json",
  v.variant("type", [
    statActionUsageCurrentCycle.schema,
    statMerged.schema,
    statReviews.schema,
    statWaitingReviews.schema,
    statRepositories.schema,
    statCost.schema,
    statCosts.schema,
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
      }),
      JSON.stringify(validated),
    );

    return c.json({ success: true });
  },
);

export const postHandler = handlers;
