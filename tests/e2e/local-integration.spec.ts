import { test, expect } from "@playwright/test";

for (const [width, height] of [[1440, 900], [390, 844], [768, 1024], [1280, 800], [1728, 900]]) {
  test(`REAL published Viewer inside listing ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/viewer");
    await expect(page.getByRole("button", { name: "Photos", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("iframe")).toHaveCount(0);
    for (const image of await page.locator("#listing-media").getByRole("img").all()) await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.screenshot({ path: `/tmp/aw029d-photos-${width}.png`, fullPage: true });
    const tour = page.getByRole("button", { name: "360° Tour", exact: true });
    const mediaHeight = (await page.locator("#listing-media").boundingBox())!.height;
    await expect(tour).toBeVisible(); await tour.click();
    const iframe = page.locator("iframe");
    await expect(iframe).toHaveAttribute("src", /^http:\/\/localhost:3000\/aw360\/v\//);
    const viewer = page.frameLocator("iframe");
    await expect(viewer.locator("canvas")).toBeVisible({ timeout: 45000 });
    await expect(viewer.getByTestId("aw360-panorama-transition")).not.toBeVisible({ timeout: 45000 });
    const frame = page.frames().find((frame) => frame.url().startsWith("http://localhost:3000/aw360/v/"))!;
    // A real public payload and WebGL canvas; no intercepted Viewer responses.
    await expect(viewer.getByRole("button", { name: "Enter fullscreen", exact: true })).toBeVisible();
    const switcher = viewer.getByTestId("aw360-view-switcher");
    const toggle = viewer.getByTestId("aw360-view-switcher-toggle");
    if (await toggle.isVisible()) await toggle.click();
    const scenes = switcher.locator('button[aria-pressed]');
    await expect.poll(() => scenes.count()).toBeGreaterThan(1);
    const startingSceneId = await switcher.locator('button[aria-pressed="true"]').getAttribute("data-testid");
    const nextScene = switcher.locator('button[aria-pressed="false"]').first();
    const nextSceneId = await nextScene.getAttribute("data-testid");
    await nextScene.click();
    await expect(viewer.getByTestId(nextSceneId!)).toHaveAttribute("aria-current", "true");
    await expect(viewer.getByTestId("aw360-panorama-transition")).not.toBeVisible({ timeout: 45000 });
    await viewer.getByTestId(startingSceneId!).click();
    await expect(viewer.getByTestId(startingSceneId!)).toHaveAttribute("aria-current", "true");
    await expect(viewer.getByTestId("aw360-panorama-transition")).not.toBeVisible({ timeout: 45000 });
    const canvas = viewer.locator("canvas");
    const bounds = (await canvas.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.45); await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width * 0.65, bounds.y + bounds.height * 0.5, { steps: 8 }); await page.mouse.up();
    await viewer.getByRole("button", { name: "Zoom in", exact: true }).click();
    await page.evaluate(async () => { window.scrollTo(0, 0); await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); });
    await expect(page.getByRole("heading", { name: "Sunset Villa", exact: true })).toBeInViewport();
    await page.screenshot({ path: `/tmp/aw029d-tour-${width}.png`, fullPage: true });
    if (width === 1440 || width === 390) {
      await viewer.getByRole("button", { name: "Enter fullscreen", exact: true }).click();
      await expect.poll(() => page.evaluate(() => document.fullscreenElement?.tagName)).toBe("IFRAME");
      await expect.poll(() => frame.evaluate(() => document.fullscreenElement != null)).toBe(true);
      await viewer.getByRole("button", { name: "Exit fullscreen", exact: true }).click();
      await expect.poll(() => page.evaluate(() => document.fullscreenElement == null)).toBe(true);
      await expect.poll(async () => (await iframe.boundingBox())!.height).toBe(mediaHeight);
      await expect(tour).toHaveAttribute("aria-pressed", "true");
      await expect(page).toHaveURL("http://localhost:3001/viewer");
    }
    await expect.poll(() => frame.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    await page.getByRole("button", { name: "Photos", exact: true }).click();
    await expect(iframe).toHaveCount(0);
    await tour.click(); await expect(viewer.locator("canvas")).toBeVisible({ timeout: 45000 });
    await expect(page).toHaveURL("http://localhost:3001/viewer");
  });
}
