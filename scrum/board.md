# Sprint Board

**Sprint aktif:** 1 (Selesai)   **Tanggal:** 2026-11-16 s.d. 2026-11-18
**Sprint Goal:** Karyawan bisa login sesuai role dan absen dari HP; admin bisa melihat rekap absensi bulanan dan mengelola data pelanggan; owner bisa mengelola akun karyawan.

| Story/Tugas | Role | Poin | Status | Catatan |
|---|---|:-:|---|---|
| Sprint 0: Repo, MySQL 8 Docker, Prisma awal, Auth skeleton, CI | All | – | Done | Tag `v0.0-sprint-0` |
| US-01 Login per role | Back-end / Front-end | 3 | Done | JWT cookie + RBAC middleware |
| US-02 Kelola akun karyawan | Back-end / Front-end | 3 | Done | `/karyawan` (OWNER only) |
| US-03 Absen masuk/pulang | Back-end / Front-end | 3 | Done | `/absensi` + WIB + BR-01/02 |
| US-04 Rekap absensi bulanan | Back-end / Front-end | 5 | Done | `/absensi/rekap` + BR-03 |
| US-05 Data pelanggan | Back-end / Front-end | 3 | Done | `/pelanggan` + soft delete |

Status: To do → Doing → Review → Done (Done hanya jika memenuhi Definition of Done).

**Poin Done kumulatif:** 17 / 76    **Velocity sprint terakhir:** 17
