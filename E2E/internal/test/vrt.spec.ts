import { expect, test } from "@playwright/test";

test("Visual Regression Test", async ({ page }) => {
  // sign-in
  await page.goto("http://localhost:10000/sign-in");
  await expect(page).toHaveScreenshot();

  // overview
  await page.goto("http://localhost:10000/demo/");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    mask: [page.locator("img"), page.locator("svg")],
  });

  // cost
  await page.goto("http://localhost:10000/demo/cost");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    mask: [page.locator("img"), page.locator("svg")],
  });

  // prs
  await page.goto("http://localhost:10000/demo/prs");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    mask: [page.locator("img"), page.locator("svg")],
  });

  // reviews
  await page.goto("http://localhost:10000/demo/reviews");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    mask: [page.locator("img"), page.locator("svg")],
  });

  // releases
  await page.goto("http://localhost:10000/demo/releases");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    mask: [page.locator("img"), page.locator("svg")],
  });

  // fourkeys
  await page.goto("http://localhost:10000/demo/fourkeys");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    mask: [page.locator("img"), page.locator("svg")],
  });

  // vulns
  await page.goto("http://localhost:10000/demo/vulns");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    mask: [page.locator("img"), page.locator("svg")],
  });

  // users
  await page.goto("http://localhost:10000/demo/users");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    mask: [page.locator("img"), page.locator("svg")],
  });

  // users/C0d3r
  await page.goto("http://localhost:10000/demo/users/C0d3r");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    mask: [page.locator("img"), page.locator("svg")],
  });

  // repositories
  await page.goto("http://localhost:10000/demo/users/repositories");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    mask: [page.locator("img"), page.locator("svg")],
  });

  // repositories/org/api
  await page.goto("http://localhost:10000/demo/users/repositories/org/api");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.05,
    mask: [page.locator("img"), page.locator("svg")],
  });
});
