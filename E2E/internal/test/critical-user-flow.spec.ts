import { expect, test } from "@playwright/test";

test("can sign up and redirect", async ({ page }) => {
  await page.goto("http://localhost:10000");

  // Confirm redirect to login page when not authenticated.
  await expect(page).toHaveTitle("git-dash sign in");

  // Confirm SignUp and redirect to dashboard page.
  await page.getByRole("link", { name: "Sign up" }).click();
  await page.getByPlaceholder("john@company.com").click();
  await page.getByPlaceholder("john@company.com").fill("test@example.com");
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("password1234xX");
  await page.getByRole("button", { name: "Sign up" }).click();

  // Confirm Logout
  await page.getByRole("button", { name: "User settings" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveTitle("git-dash sign in");

  // Confirm can re-login and redirect to dashboard page.
  await page.getByPlaceholder("email").fill("test@example.com");
  await page.getByPlaceholder("john@company.com").click();
  await page.getByPlaceholder("john@company.com").fill("test@example.com");
  await page.getByPlaceholder("Password").click();
  await page.getByPlaceholder("Password").fill("password1234xX");
  await page.getByRole("button", { name: "User settings" }).click();
});
