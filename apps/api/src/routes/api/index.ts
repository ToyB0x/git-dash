import {
  type VerifyFirebaseAuthConfig,
  verifyFirebaseAuth,
} from "@hono/firebase-auth";
import { Hono } from "hono";
import { dbRoute } from "./db";
import { memberRoute } from "./members";
import { userRoute } from "./users";
import { workspaceRoute } from "./workspaces";

export const apiRoute = new Hono<{ Bindings: Env }>()
  .use("/*", (c, next) => {
    const projectId = c.env.PUBLIC_FIREBASE_PROJECT_ID || "local"; // in ci, the env var is undefined
    const config: VerifyFirebaseAuthConfig = {
      projectId,
    };

    if (projectId === "local") {
      config.firebaseEmulatorHost = "http://127.0.0.1:9099";
    }

    // NOTE: at this point, the user is "not" verified with database nor firebase token. (because rpc can't type middleware response / error, we handle it in the route handler)
    // ref: https://github.com/honojs/hono/issues/2719
    return verifyFirebaseAuth(config)(c, next);
  })
  .route("/workspaces", workspaceRoute)
  .route("/members", memberRoute)
  .route("/users", userRoute)
  .route("/db", dbRoute);
