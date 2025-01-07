import { expect, test } from "@playwright/test";

test("can sign up and redirect", async ({ page }) => {
  const testEmail = `test+${crypto.randomUUID()}@example.com`;

  await page.goto("http://localhost:10000");

  // Confirm redirect to login page when not authenticated.
  await expect(page).toHaveTitle("git-dash sign in");

  // Confirm SignUp and redirect to dashboard page.

  // NOTE: currently, hide sign-up link and disable self sign-up page.
  // await page.getByRole("link", { name: "Sign up" }).click();
  // (as workaround directly access to sign-up page)
  await page.goto("http://localhost:10000/sign-up");
  await page.getByPlaceholder("john@company.com").click();
  await page.getByPlaceholder("john@company.com").fill(testEmail);
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("password1234xX");
  await page.getByRole("button", { name: "Sign up" }).click();

  // Confirm Logout
  await page.getByRole("button", { name: "User settings" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveTitle("git-dash sign in");

  // Confirm can re-login and redirect to dashboard page.
  await page.getByPlaceholder("john@company.com").click();
  await page.getByPlaceholder("john@company.com").fill(testEmail);
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("password1234xX");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: "User settings" }).click();
});
