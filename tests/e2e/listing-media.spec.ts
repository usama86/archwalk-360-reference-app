import { test, expect } from "@playwright/test";

test.beforeEach(async ({ request }) => { await request.post("http://127.0.0.1:3216/fixture-state?state=published"); });

test("Photos defaults, keyboard tour mount and resource release", async ({ page }) => {
  await page.goto("/viewer");
  const photos = page.getByRole("button", { name: "Photos", exact: true });
  const tour = page.getByRole("button", { name: "360° Tour", exact: true });
  await expect(photos).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.locator("#listing-media").getByRole("img")).toHaveCount(3);
  const before = (await page.locator("#listing-media").boundingBox())!;
  await tour.focus(); await page.keyboard.press("Enter");
  await expect(tour).toBeFocused();
  await expect(tour).toHaveAttribute("aria-pressed", "true");
  const iframe = page.locator("iframe");
  await expect(iframe).toHaveAttribute("src", "http://127.0.0.1:3216/aw360/v/fixture-public");
  await expect(iframe).toHaveAttribute("allow", "fullscreen");
  await expect(iframe).toHaveAttribute("allowfullscreen", "");
  const node = await iframe.elementHandle();
  const after = (await page.locator("#listing-media").boundingBox())!;
  expect(Math.abs(after.height - before.height)).toBeLessThan(2);
  expect(Math.abs(after.y - before.y)).toBeLessThan(2);
  await photos.focus(); await page.keyboard.press("Space");
  await expect(photos).toBeFocused();
  await expect(iframe).toHaveCount(0);
  expect(await node!.evaluate((element) => element.isConnected)).toBe(false);
  await tour.click(); await expect(iframe).toHaveCount(1);
  expect(await node!.evaluate((element) => element.isConnected)).toBe(false);
  await expect(page).toHaveURL(/\/viewer$/);
});

for (const state of ["unpublished", "unavailable"]) {
  test(`${state} tour leaves a clean photo listing`, async ({ page, request }) => {
    await request.post(`http://127.0.0.1:3216/fixture-state?state=${state}`);
    await page.goto("/viewer");
    await expect(page.getByRole("heading", { name: "Sunset Villa", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "360° Tour", exact: true })).toHaveCount(0);
    await expect(page.locator("#listing-media").getByRole("img")).toHaveCount(3);
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.getByText("SECRET CONFIGURATION DETAIL")).toHaveCount(0);
  });
}

for (const [width, height] of [[390, 844], [768, 1024], [1280, 800], [1440, 900], [1728, 900]]) {
  test(`media footprint at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height }); await page.goto("/viewer");
    await expect(page.locator("#listing-media").getByRole("img").first()).toBeVisible();
    for (const image of await page.locator("#listing-media").getByRole("img").all()) await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const media = page.locator("#listing-media"); const before = (await media.boundingBox())!;
    for (const button of await page.getByRole("group", { name: "Choose property media" }).getByRole("button").all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.locator("body").evaluate((element) => element.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await page.getByRole("button", { name: "360° Tour", exact: true }).click();
    const iframe = (await page.locator("iframe").boundingBox())!;
    expect(Math.abs(iframe.height - before.height)).toBeLessThan(2);
    expect(Math.abs(iframe.width - before.width)).toBeLessThan(2);
    expect(iframe.height).toBeGreaterThanOrEqual(360);
  });
}

test("credential sentinel stays outside browser HTML and loaded scripts", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", async (response) => { if (response.request().resourceType() === "script") scripts.push(await response.text()); });
  await page.goto("/viewer");
  await expect(page.getByRole("button", { name: "360° Tour" })).toBeVisible();
  expect(await page.content()).not.toContain("listing-browser-secret-sentinel");
  expect(scripts.join("\n")).not.toContain("listing-browser-secret-sentinel");
  expect(await page.content()).not.toContain("SECRET CONFIGURATION DETAIL");
});

test("unconfigured partner still serves a normal customer listing", async ({ page }) => {
  await page.goto("http://127.0.0.1:3003/viewer");
  await expect(page.getByRole("heading", { name: "Sunset Villa", exact: true })).toBeVisible();
  await expect(page.locator("#listing-media").getByRole("img")).toHaveCount(3);
  await expect(page.getByRole("button", { name: "360° Tour", exact: true })).toHaveCount(0);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.getByText("ArchWalk 360 is not configured for this host yet.")).toHaveCount(0);
});
