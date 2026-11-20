# Sprint Board

**Sprint aktif:** 2 (Selesai Sprint 0–2 · Target Demo Minggu Depan)   **Tanggal:** 2026-11-19 s.d. 2026-11-22
**Sprint Goal:** Admin bisa mengelola bahan & supplier, mencatat stok masuk, keluar, dan opname dengan aman (tidak pernah minus), melihat peringatan merah stok menipis di Dashboard (AC PPT Slide 15), serta menginput izin/sakit karyawan.

| Story/Tugas | Role | Poin | Status | Catatan |
|---|---|:-:|---|---|
| Sprint 0: Repo, MySQL 8 Docker, Prisma awal, Auth skeleton, CI | All | – | Done | Tag `v0.0-sprint-0` (15–16 Nov 2026) |
| US-01 Login per role | Back-end / Front-end | 3 | Done | Sprint 1 (`v0.1-sprint-1`) |
| US-02 Kelola akun karyawan | Back-end / Front-end | 3 | Done | Sprint 1 · `/karyawan` (OWNER only) |
| US-03 Absen masuk/pulang | Back-end / Front-end | 3 | Done | Sprint 1 · `/absensi` + WIB + BR-01/02 |
| US-04 Rekap absensi bulanan | Back-end / Front-end | 5 | Done | Sprint 1 · `/absensi/rekap` + BR-03 |
| US-05 Data pelanggan | Back-end / Front-end | 3 | Done | Sprint 1 · `/pelanggan` + soft delete |
| US-06 Data bahan & stok minimum | Back-end / Front-end | 3 | Done | Sprint 2 · `/stok` + supplier |
| US-07 Stok masuk & keluar | Back-end / QA | 5 | Done | Sprint 2 · `/stok/mutasi` + `$transaction` concurrency test |
| US-08 Peringatan stok minimum | Back-end / Front-end | 5 | Done | Sprint 2 · Badge + banner merah Dashboard (AC PPT Slide 15) |
| US-09 Stock opname | Back-end / Front-end | 3 | Done | Sprint 2 · Wajib `reason`, OWNER/ADMIN |
| US-10 Izin/sakit karyawan | Back-end / Front-end | 2 | Done | Sprint 2 · Form izin di `/absensi/rekap` |
| US-11 s.d. US-16 (Pesanan, Produksi & Produktivitas) | All | 25 | To do | Terjadwal Sprint 3 (`23 Nov–6 Des 2026`, branch `sprint-3`) |
| US-17 s.d. US-20 + Backup & UAT | All | 16 | To do | Terjadwal Sprint 4 (`7–20 Des 2026`, branch `sprint-4`) |

Status: To do → Doing → Review → Done (Done hanya jika memenuhi Definition of Done).

**Poin Done kumulatif:** 35 / 76    **Velocity sprint terakhir:** 18 (Sprint 1+2 tuntas dalam 1 minggu)
