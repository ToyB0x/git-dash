import { test } from "@playwright/test";

test("can see demo pages", async ({ page }) => {
  // overview page
  await page.goto("http://localhost:10000/demo");
  await page.getByText("128").click();

  // cost page
  await page.getByRole("link", { name: "Cost", exact: true }).click();
  await page.getByText("Actions 2core").click();

  // vulns page
  await page.getByRole("link", { name: "Vulns" }).click();
  await page.getByText("141").click();

  // four keys page
  await page.getByRole("link", { name: "Four Keys" }).click();
  await page.getByRole("link", { name: "api" }).click();

  // users page
  await page.getByRole("link", { name: "Users" }).click();
  await page.getByRole("link", { name: "C0d3r" }).click();

  // repositories page
  await page.getByRole("link", { name: "Repositories" }).click();
  await page.getByRole("link", { name: "api" }).click();
});
