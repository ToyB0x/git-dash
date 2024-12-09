import {
  type VerifyFirebaseAuthConfig,
  verifyFirebaseAuth,
} from "@hono/firebase-auth";
import { Hono } from "hono";
import { groupRoute } from "./groups";
import { memberRoute } from "./members";
import { reportMetaRoute } from "./report-meta";
import { reportRoute } from "./reports";
import { userRoute } from "./users";

export const apiRoute = new Hono<{ Bindings: Env }>()
  .use("/*", (c, next) => {
    const projectId = c.env.PUBLIC_FIREBASE_PROJECT_ID || "local"; // in ci, the env var is undefined
    const config: VerifyFirebaseAuthConfig = {
      projectId,
    };

    if (projectId === "local") {
      config.firebaseEmulatorHost = "http://127.0.0.1:9099";
    }

    return verifyFirebaseAuth(config)(c, next);
  })
  .route("/groups", groupRoute)
  .route("/members", memberRoute)
  .route("/reports", reportRoute)
  .route("/reports-meta", reportMetaRoute)
  .route("/users", userRoute);
