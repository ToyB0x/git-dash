import { vValidator } from "@hono/valibot-validator";
import { getR2Path } from "@repo/schema/path";
import { stat as statActionUsageCurrentCycle } from "@repo/schema/statActionUsageCurrentCycle";
import { stat as statCost } from "@repo/schema/statCost";
import {
  type Schema as SchemaCosts,
  stat as statCosts,
} from "@repo/schema/statCosts";
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

    // handle costs via daily cost report
    if (validated.type === statCost.type) {
      const prevReportR2 = await c.env.REPORT_BUCKET.get(
        getR2Path({
          workspaceId: c.var.validWorkspaceId,
          reportId: validated.reportId,
          type: statCosts.type,
        }),
      );

      let prevReportParsed: SchemaCosts | undefined = undefined;
      if (prevReportR2) {
        prevReportParsed = v.parse(statCosts.schema, await prevReportR2.json());
      }

      const merged = prevReportParsed
        ? {
            ...prevReportParsed,
            stats: [...prevReportParsed.stats, validated.stats],
          }
        : {
            reportId: validated.reportId,
            type: statCosts.type,
            version: statCosts.version,
            stats: [validated.stats],
          };

      await c.env.REPORT_BUCKET.put(
        getR2Path({
          workspaceId: c.var.validWorkspaceId,
          reportId: validated.reportId,
          type: statCosts.type,
        }),
        JSON.stringify(merged),
      );

      return c.json({ success: true });
    }

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
