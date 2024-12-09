import {
  type VerifyFirebaseAuthConfig,
  type VerifyFirebaseAuthEnv,
  verifyFirebaseAuth,
} from "@hono/firebase-auth";
import { Hono } from "hono";
import { except } from "hono/combine";
import { cors } from "hono/cors";
import {
  groupRoute,
  healthRoute,
  memberRoute,
  reportMetaRoute,
  reportRoute,
  userRoute,
} from "./routes";

export const app = new Hono<{ Bindings: VerifyFirebaseAuthEnv }>()
  .route("/health", healthRoute)
  .use(
    cors({
      origin: ["http://localhost:10000"],
    }),
  )
  .use(
    "/*",
    except("/*/public/*", (c, next) => {
      const projectId = c.env.PUBLIC_FIREBASE_PROJECT_ID || "local"; // in ci, the env var is undefined
      const config: VerifyFirebaseAuthConfig = {
        projectId,
      };

      if (projectId === "local") {
        config.firebaseEmulatorHost = "http://127.0.0.1:9099";
      }

      return verifyFirebaseAuth(config)(c, next);
    }),
  )
  .route("/groups", groupRoute)
  .route("/members", memberRoute)
  .route("/reports", reportRoute)
  .route("/reports-meta", reportMetaRoute)
  .route("/users", userRoute);
