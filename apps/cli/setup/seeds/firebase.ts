import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { SampleUser } from "../constants/user";

// biome-ignore lint/complexity/useLiteralKeys: <explanation>
process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "127.0.0.1:9099";
const app = initializeApp({
  projectId: "local",
});

export const createFirebaseUser = async () => {
  const exsistUser = await getAuth(app).getUser(SampleUser.uid);
  if (exsistUser) {
    console.log("User already exists:", exsistUser.uid);
    return;
  }

  const userRecord = await getAuth(app).createUser(SampleUser);

  // See the UserRecord reference doc for the contents of userRecord.
  console.log("Successfully created new user:", userRecord.uid);
};
