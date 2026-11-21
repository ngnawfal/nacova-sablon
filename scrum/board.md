# Sprint Board

**Sprint aktif:** Sprint 2 (`✅ Selesai Sprint 0–2 · Siap Demo`)   **Periode:** 2026-11-19 s.d. 2026-11-22   **Diperbarui:** 2026-11-21
**Sprint Goal:** Admin bisa mengelola bahan & supplier, mencatat stok masuk, keluar, dan opname dengan aman (tidak pernah minus), melihat peringatan merah stok menipis di Dashboard (AC PPT Slide 15), serta menginput izin/sakit karyawan.

> **Tautan Rilis Sprint 1–2:**
> - **Web Produksi:** [https://rpl.nawf.dev](https://rpl.nawf.dev)
> - **Desain UI/UX Figma (17 layar Desktop 1280px & Mobile 360px):** [Nacova Sablon — Sprint 1–2](https://www.figma.com/design/x5gSN6yQRWvB4R4JKasgs1)

| Story / Tugas | Role | Poin | Status | Catatan |
|---|---|:-:|---|---|
| Sprint 0: Repo, MySQL 8 Docker, Prisma awal, Auth skeleton, CI | All | – | ✅ Done | Tag `v0.0-sprint-0` (15–16 Nov 2026) |
| US-01 Login per role | Back-end / Front-end | 3 | ✅ Done | Sprint 1 (`v0.1-sprint-1`) |
| US-02 Kelola akun karyawan | Back-end / Front-end | 3 | ✅ Done | Sprint 1 · `/karyawan` (OWNER only) |
| US-03 Absen masuk/pulang | Back-end / Front-end | 3 | ✅ Done | Sprint 1 · `/absensi` + WIB + BR-01/02 |
| US-04 Rekap absensi bulanan | Back-end / Front-end | 5 | ✅ Done | Sprint 1 · `/absensi/rekap` + BR-03 |
| US-05 Data pelanggan | Back-end / Front-end | 3 | ✅ Done | Sprint 1 · `/pelanggan` + soft delete |
| US-06 Data bahan & stok minimum | Back-end / Front-end | 3 | ✅ Done | Sprint 2 · `/stok` + supplier |
| US-07 Stok masuk & keluar | Back-end / QA | 5 | ✅ Done | Sprint 2 · `/stok/mutasi` + `$transaction` concurrency test |
| US-08 Peringatan stok minimum | Back-end / Front-end | 5 | ✅ Done | Sprint 2 · Badge + banner merah Dashboard (AC PPT Slide 15) |
| US-09 Stock opname | Back-end / Front-end | 3 | ✅ Done | Sprint 2 · Wajib `reason`, OWNER/ADMIN |
| US-10 Izin/sakit karyawan | Back-end / Front-end | 2 | ✅ Done | Sprint 2 · Form izin di `/absensi/rekap` |
| UI/UX Sprint 1–2 (Design System + 8 Desktop + 8 Mobile di Figma) | UI/UX | – | ✅ Done | Figma Live + `docs/design/nacova-sprint-1-2.fig` |
| Deploy Sprint 1–2 ke Produksi & Rilis Tag `v0.2-sprint-2` | All | – | ✅ Done | Live di `https://rpl.nawf.dev` (`sprint: 2`) |
| US-11 s.d. US-16 (Pesanan, Produksi & Produktivitas) | All | 25 | ⬜ To Do | Terjadwal Sprint 3 (`23 Nov – 6 Des 2026`) |
| US-17 s.d. US-20 + Backup Rutin & UAT | All | 16 | ⬜ To Do | Terjadwal Sprint 4 (`7 – 20 Des 2026`) |

**Legenda Status:** `⬜ To Do` → `🔄 In Progress` → `👀 Review` → `✅ Done` *(Done hanya jika memenuhi Definition of Done)*

**Poin Done kumulatif:** `35 / 76` (**46%**) · **Velocity Sprint 1:** `17` · **Velocity Sprint 2:** `18`
