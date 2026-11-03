import { expect, test } from "@playwright/test";

test("home exposes the primary site navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ScottWang/);
  await expect(page.getByRole("link", { name: "Blog", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Resources", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Sites", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Projects", exact: true })).toBeVisible();
});

test("content index filters resource entries and keeps legacy views", async ({ page }) => {
  await page.goto("/content?kind=note");
  await expect(page.locator("h1")).toHaveText("Blog");
  await expect(page.getByText("5W2H：把一件模糊的事问完整")).toBeVisible();
  await page.goto("/notes");
  await expect(page.locator("h1")).toHaveText("Notes");
});

test("sites page exposes the compact responsive collection", async ({ page }) => {
  await page.goto("/sites");
  await expect(page.locator("h1")).toHaveText("Sites");
  await expect(page.locator(".sites-grid")).toBeVisible();
  await expect(page.locator("#chinese-poetry h3")).toContainText("中华古诗词数据库");
  await expect(page.locator("#chinese-poetry .site-source-repo")).toHaveText(/chinese-poetry/);
  await expect(page.locator("#chinese-poetry .site-source-repo")).toHaveAttribute("href", "https://github.com/chinese-poetry/chinese-poetry");
  await expect(page.locator("#chinese-poetry .site-source-label")).toHaveText("仓库");
  await expect(page.locator("#chinese-poetry .site-source-icon")).toBeVisible();
  await expect(page.locator("#chinese-poetry h3 > a")).toHaveAttribute("href", "https://awesome-poetry.top/");
  await expect(page.locator("#scikit-learn-user-guide h3")).toContainText("scikit-learn User Guide");
  await expect(page.locator("#scikit-learn-user-guide .site-source-repo")).toHaveAttribute("href", "https://github.com/scikit-learn/scikit-learn");
  await expect(page.locator("#scikit-learn-user-guide .site-source-extra").filter({ hasText: "BSD-3-Clause" })).toBeVisible();
  await expect(page.locator("#scikit-learn-user-guide .github-repo-card")).toHaveCount(0);
  await expect(page.locator("#scikit-learn-user-guide .site-links")).toHaveCount(0);
  await expect(page.locator("#civilization-map h3")).toContainText("Civilization Map");
  await expect(page.locator("#civilization-map .site-source-label")).toHaveText("网址");
  await expect(page.locator("#civilization-map .site-source-url")).toHaveAttribute("href", "https://civilizationmap.org/");
  await expect(page.locator("#openhistoricalmap h3")).toContainText("OpenHistoricalMap");
  await expect(page.locator("#openhistoricalmap .site-source-repo")).toHaveAttribute("href", "https://github.com/OpenHistoricalMap/ohm-website");
  await expect(page.locator(".sites-grid")).toHaveCSS("grid-template-columns", /\d+px/);
  expect(await page.locator(".sites-grid").evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length)).toBe(2);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".sites-grid")).toHaveCSS("grid-template-columns", /\d+px/);
  expect(await page.locator(".sites-grid").evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length)).toBe(1);
});

test("about exposes social profiles", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/wyf0931");
  await expect(page.getByRole("link", { name: /X/ })).toHaveAttribute("href", "https://x.com/wyf0931");
});

test("search finds Chinese content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByPlaceholder("搜索文章、项目和站点…").fill("Agent");
  await expect(page.locator(".search-result").first()).toBeVisible();
});

test("Markdown renders GFM tables and Mermaid diagrams", async ({ page }) => {
  await page.goto("/notes/5w2h");
  await expect(page.locator("table")).toBeVisible();
  await expect(page.locator(".mermaid-diagram")).toBeVisible();
});

test("UDP note renders the packet diagram", async ({ page }) => {
  await page.goto("/notes/udp-packet");
  await expect(page.locator("h1")).toContainText("UDP 数据包");
  await expect(page.locator(".mermaid-diagram")).toBeVisible();
});

test("GitHub project cards can be placed inside article content", async ({ page }) => {
  await page.goto("/notes/human-writing-skill");
  await expect(page.locator(".article-body .github-repo-card")).toBeVisible();
  await expect(page.locator(".article-body .github-repo-icon")).toBeVisible();
  await expect(page.getByRole("link", { name: "View on GitHub ↗" })).toHaveAttribute("href", "https://github.com/KKKKhazix/human-writing");
  await expect(page.locator(".article-layout > .github-repo-card")).toHaveCount(0);
});

test("theme toggle switches between light and dark mode", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
