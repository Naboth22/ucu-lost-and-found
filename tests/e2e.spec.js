import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "Mobile Small (360px)", width: 360, height: 800 },
  { name: "Mobile Standard (390px)", width: 390, height: 844 },
  { name: "Tablet (768px)", width: 768, height: 1024 },
  { name: "Laptop (1024px)", width: 1024, height: 768 },
  { name: "Desktop (1440px)", width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`Responsive layout check without horizontal overflow at ${vp.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("http://localhost:5173/");
    await expect(page.getByText("UCU Campus Lost & Found")).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
}

test("End-to-end Admin login and live dashboard render", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page
    .getByPlaceholder("name@students.ucu.ac.ug")
    .fill("d.tumusiime@ucu.ac.ug");
  await page.getByPlaceholder("••••••••").fill("Password@123");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/admin\/dashboard/);
  await expect(
    page.getByText("Administrator Analytics & Control"),
  ).toBeVisible();
});
