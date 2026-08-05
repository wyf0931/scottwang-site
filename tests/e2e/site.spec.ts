import { expect, test } from "@playwright/test";

test("home exposes the primary site navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ScottWang/);
  await expect(page.getByRole("link", { name: "Content", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Research" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Projects" })).toBeVisible();
});

test("content index filters resource entries and keeps legacy views", async ({ page }) => {
  await page.goto("/content?kind=resource");
  await expect(page.locator("h1")).toHaveText("Content");
  await expect(page.getByText("Agent 工程资源书签")).toBeVisible();
  await page.goto("/notes");
  await expect(page.locator("h1")).toHaveText("Notes");
});

test("research report exposes SEO and raw Markdown", async ({ page, request }) => {
  await page.goto("/research/ai-agent-platforms-2026");
  await expect(page.locator("h1")).toContainText("AI Agent 平台");
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  const raw = await request.get("/research/ai-agent-platforms-2026.md");
  expect(raw.ok()).toBeTruthy();
  expect(await raw.text()).toContain("status: \"Published\"");
});

test("about exposes social profiles", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/wyf0931");
  await expect(page.getByRole("link", { name: /X/ })).toHaveAttribute("href", "https://x.com/wyf0931");
});

test("search finds Chinese content", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByPlaceholder("搜索文章、笔记和思考…").fill("Agent");
  await expect(page.locator(".search-result").first()).toBeVisible();
});

test("Markdown renders GFM tables and Mermaid diagrams", async ({ page }) => {
  await page.goto("/notes/5w2h");
  await expect(page.locator("table")).toBeVisible();
  await expect(page.locator(".mermaid-diagram")).toBeVisible();
});

test("theme toggle switches between light and dark mode", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
