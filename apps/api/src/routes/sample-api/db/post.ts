import {
  generateNewSampleWorkspaceId,
  reportSampleTbl,
} from "@git-dash/db-api/schema";
import { vValidator } from "@hono/valibot-validator";
import { drizzle } from "drizzle-orm/d1";
import { bodyLimit } from "hono/body-limit";
import { getConnInfo } from "hono/cloudflare-workers";
import { createFactory } from "hono/factory";
import * as v from "valibot";
import { getR2PathSample } from "../../../constants";

const factory = createFactory<{ Bindings: Env }>();

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
    const sampleWorkspaceId = generateNewSampleWorkspaceId();

    await db.insert(reportSampleTbl).values({
      id: sampleWorkspaceId,
      ip: getConnInfo(c).remote.address || "missing",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await c.env.REPORT_DB_BUCKET_SAMPLE.put(
      getR2PathSample({ sampleWorkspaceId }),
      validated.file,
    );

    return c.json({ success: true, sampleWorkspaceId });
  },
);

export const postHandler = handlers;
