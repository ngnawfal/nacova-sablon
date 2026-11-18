import { expect, test } from "@playwright/test";

test.describe("Nacova E2E — Sprint 1 (Auth, RBAC, Absensi, Pelanggan)", () => {
  test("login sebagai ADMIN, cek akses pelanggan & tolak akses /karyawan", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@nacova.id");
    await page.fill('input[name="password"]', "nacova123");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/");
    await expect(page.getByRole("heading", { name: "Ringkasan" })).toBeVisible();

    await page.goto("/pelanggan");
    await expect(page.getByRole("heading", { name: "Data Pelanggan" })).toBeVisible();

    await page.goto("/karyawan");
    await page.waitForURL("**/?forbidden=1");
    await expect(page.getByText("Akses ditolak")).toBeVisible();
  });

  test("PRODUCTION login di viewport 360px membuka /absensi tanpa overflow horizontal", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/login");
    await page.fill('input[name="email"]', "produksi@nacova.id");
    await page.fill('input[name="password"]', "nacova123");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/");
    await page.goto("/absensi");
    await expect(page.getByText("Absensi Harian")).toBeVisible();

    const noHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(noHorizontalOverflow).toBe(true);
  });

  test("OWNER mengakses /karyawan dan /absensi/rekap", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "owner@nacova.id");
    await page.fill('input[name="password"]', "nacova123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/");

    await page.goto("/karyawan");
    await expect(page.getByText("Kelola Akun Karyawan")).toBeVisible();

    await page.goto("/absensi/rekap");
    await expect(page.getByText("Rekap Absensi Bulanan")).toBeVisible();
  });
});
