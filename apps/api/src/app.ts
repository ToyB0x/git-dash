import {
  type VerifyFirebaseAuthConfig,
  type VerifyFirebaseAuthEnv,
  verifyFirebaseAuth,
} from "@hono/firebase-auth";
import { Hono } from "hono";
import { except } from "hono/combine";
import { cors } from "hono/cors";
import { reportMetaRoute, reportRoute } from "./routes";

export const app = new Hono<{ Bindings: VerifyFirebaseAuthEnv }>()
  .use(
    cors({
      origin: ["http://localhost:10000"],
    }),
  )
  .use(
    "/*",
    except("/*/public/*", (c, next) => {
      const config: VerifyFirebaseAuthConfig = {
        projectId: c.env.PUBLIC_FIREBASE_PROJECT_ID,
      };
      return verifyFirebaseAuth(config)(c, next);
    }),
  )
  .route("/reports", reportRoute)
  .route("/reports-meta", reportMetaRoute);
