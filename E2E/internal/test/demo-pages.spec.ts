import { test } from "@playwright/test";

test("can see demo pages", async ({ page }) => {
  // TODO: 以下のテストを追加する
  // ログアウトした状態で利用規約を見れること
  // ログアウトした状態でプライバシーポリシーを見れること

  // ログアウトした状態でDemoページ全体を見れること
  // overview page
  await page.goto("http://localhost:10000/demo");
  await page.getByText("128").click();

  // cost page
  await page.getByRole("link", { name: "Payments", exact: true }).click();
  await page.getByText("Actions 2core").click();

  // vulns page
  await page.getByRole("link", { name: "Vulnerabilities" }).click();
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
