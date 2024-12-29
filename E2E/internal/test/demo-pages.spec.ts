import { test } from "@playwright/test";

test("can see demo pages", async ({ page }) => {
  // overview page
  await page.goto("http://localhost:10000/demo");
  await page.getByText("128").click();

  // cost page
  await page.getByRole("link", { name: "Cost", exact: true }).click();
  await page.getByText("$891.00").click();

  // prs page
  await page.getByRole("link", { name: "PRs" }).click();
  await page.getByText("9.1 days").click();

  // reviews page
  await page.getByRole("link", { name: "Reviews" }).click();
  await page.getByText("3.1 hours").click();

  // releases page
  await page.getByRole("link", { name: "Releases" }).click();
  await page.getByText("9.1 days").click();

  // four keys page
  await page.getByRole("link", { name: "Four Keys" }).click();
  await page.getByRole("link", { name: "api" }).click();

  // vulns page
  await page.getByRole("link", { name: "Vulns" }).click();
  await page.getByText("141").click();

  // users page
  await page.getByRole("link", { name: "Users" }).click();
  await page.getByRole("link", { name: "C0d3r" }).click();

  // repositories page
  await page.getByRole("link", { name: "Repositories" }).click();
  await page.getByRole("link", { name: "api" }).click();
});
