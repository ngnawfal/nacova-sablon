import { expect, test } from "@playwright/test";

test.describe("Nacova E2E — Sprint 1 & 2 (Auth, Absensi, Pelanggan, Stok & Peringatan Minimum)", () => {
  test("ADMIN melihat peringatan merah Tinta Plastisol Putih di Dashboard, akses pelanggan, dan ditolak di /karyawan", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@nacova.id");
    await page.fill('input[name="password"]', "nacova123");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/");
    await expect(page.getByRole("heading", { name: "Ringkasan" })).toBeVisible();
    await expect(page.getByText("Tinta Plastisol Putih hampir habis")).toBeVisible();

    const collapseBtn = page.getByRole("button", { name: "Perkecil sidebar" });
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await expect(page.getByRole("button", { name: "Perluas sidebar" })).toBeVisible();
      await page.getByRole("button", { name: "Perluas sidebar" }).click();
      await expect(collapseBtn).toBeVisible();
    }

    await page.goto("/pelanggan");
    await expect(page.getByRole("heading", { name: "Data Pelanggan" })).toBeVisible();

    await page.goto("/karyawan");
    await page.waitForURL("**/?forbidden=1");
    await expect(page.getByText("Akses ditolak")).toBeVisible();
  });

  test("PRODUCTION login di viewport 360px membuka Dashboard dan /absensi tanpa overflow horizontal", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/login");
    await page.fill('input[name="email"]', "produksi@nacova.id");
    await page.fill('input[name="password"]', "nacova123");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/");
    const dashNoOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(dashNoOverflow).toBe(true);

    await page.goto("/absensi");
    await expect(page.getByText("Absensi Harian")).toBeVisible();

    const absNoOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(absNoOverflow).toBe(true);
  });

  test("OWNER mengakses /karyawan, /absensi/rekap (izin), /stok, dan /stok/mutasi", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "owner@nacova.id");
    await page.fill('input[name="password"]', "nacova123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/");

    await page.goto("/karyawan");
    await expect(page.getByText("Kelola Akun Karyawan")).toBeVisible();

    await page.goto("/absensi/rekap");
    await expect(page.getByText("Input Izin / Sakit / Cuti Karyawan")).toBeVisible();

    await page.goto("/stok");
    await expect(page.locator("a:visible", { hasText: "Tinta Plastisol Putih" })).toBeVisible();

    await page.goto("/stok/mutasi");
    await expect(page.getByRole("heading", { name: /Mutasi/i }).first()).toBeVisible();

    // Modul Sprint 3 & 4 belum dirilis di Sprint 2 -> redirect bersih ke /
    await page.goto("/pesanan");
    await page.waitForURL("**/");
    const ordersApi = await page.request.get("/api/orders");
    expect(ordersApi.status()).toBe(404);
  });
});
