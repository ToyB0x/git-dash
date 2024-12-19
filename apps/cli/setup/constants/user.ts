import type { CreateRequest } from "firebase-admin/auth";

export const SampleUser = {
  uid: "uid1",
  email: "user1@example.com",
  emailVerified: true,
  password: "pass",
  displayName: "User 1",
  disabled: false,
} satisfies CreateRequest;
