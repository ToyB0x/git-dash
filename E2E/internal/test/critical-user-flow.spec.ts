import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test("get started link", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Click the get started link.
  await page.getByRole("link", { name: "Get started" }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(
    page.getByRole("heading", { name: "Installation" }),
  ).toBeVisible();
});

test("can sign up and redirect", async ({ page }) => {
  await page.goto("http://localhost:10000");

  // Confirm redirect to login page when not authenticated.
  await expect(page).toHaveTitle("Login");

  // Confirm SignUp and redirect to dashboard page.
  await page.goto("http://localhost:10000/signup");
  await page.getByPlaceholder("email").fill("test@example.com");
  await page.getByPlaceholder("password").fill("password1234X");
  await page.getByRole("button", { name: "login" }).click();
  await expect(page).toHaveTitle("Dashboard");

  // Confirm Logout
  await page.goto("http://localhost:10000/signup");

  // Confirm can re-login and redirect to dashboard page.
  await page.goto("http://localhost:10000/login");
  await page.getByPlaceholder("email").fill("test@example.com");
  await page.getByPlaceholder("password").fill("password1234X");
  await page.getByRole("button", { name: "login" }).click();
  await expect(page).toHaveTitle("Dashboard");
});
