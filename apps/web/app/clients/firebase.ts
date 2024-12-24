import { publicViteEnv } from "@/env";
import { type FirebaseOptions, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

const firebaseConfigsBrowser = {
  projectId:
    publicViteEnv.MODE === "development"
      ? "local" // dev mode and ci
      : publicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey:
    publicViteEnv.MODE === "development"
      ? "local"
      : publicViteEnv.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY,
} satisfies FirebaseOptions;

const firebaseAppBrowser = initializeApp(firebaseConfigsBrowser);

const _auth = getAuth(firebaseAppBrowser);

if (
  publicViteEnv.MODE === "development" || // with dev mode
  publicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID === "local" // with production mode but in ci / e2e
) {
  connectAuthEmulator(_auth, "http://127.0.0.1:9099");
}

export const auth = _auth;
