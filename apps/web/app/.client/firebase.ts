import { type FirebaseOptions, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { publicViteEnv } from "~/env";

const firebaseConfigsBrowser = {
  projectId: publicViteEnv.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: publicViteEnv.VITE_PUBLIC_FIREBASE_BROWSER_API_KEY,
} satisfies FirebaseOptions;

const firebaseAppBrowser = initializeApp(firebaseConfigsBrowser);

export const auth = getAuth(firebaseAppBrowser);

if (publicViteEnv.MODE === "development") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}
