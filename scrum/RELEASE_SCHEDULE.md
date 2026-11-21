# Jadwal Rilis Bertahap (Step-by-Step Sprint Schedule)

Dokumen ini memetakan jadwal rilis per sprint sesuai presentasi **Scrum Kick-off Sablon Nacova** (4 sprint) dan target perkuliahan (Sprint 1 & 2 selesai dalam 1 minggu pertama, dilanjutkan Sprint 3 & Sprint 4 masing-masing 2 minggu).

## Peta Branch, Tag & Status Rilis

| Sprint | Periode | Durasi | Branch | Tag | Status | Fitur Utama (Sesuai PPT Slide 13–15) |
|---|---|---|---|---|---|---|
| **Sprint 0** | 15–16 Nov 2026 | Persiapan | `sprint-0` | `v0.0-sprint-0` | ✅ Done | Repo `backend/` + `frontend/`, Docker MySQL 8, Prisma awal, Auth skeleton, UI kit, CI & setup Scrum |
| **Sprint 1** | 16–18 Nov 2026 | 3 hari *(1 minggu S1+S2)* | `sprint-1` | `v0.1-sprint-1` | ✅ Done | Login per role (`US-01`), kelola akun karyawan (`US-02`), absen masuk/pulang WIB (`US-03`), rekap absensi bulanan (`US-04`), data pelanggan (`US-05`) |
| **Sprint 2** | 19–22 Nov 2026 | 4 hari *(1 minggu S1+S2)* | `sprint-2` / `main` | `v0.2-sprint-2` | ✅ Done *(Live di `rpl.nawf.dev`)* | Data bahan & supplier (`US-06`), stok masuk/keluar atomic (`US-07`), peringatan stok minimum merah di Dashboard (`US-08`, AC PPT Slide 15), stock opname (`US-09`), izin/sakit karyawan (`US-10`), Desain Figma Desktop & Mobile |
| **Sprint 3** | 23 Nov – 6 Des 2026 | 2 minggu *(jadwal PPT)* | `sprint-3` | `v0.3-sprint-3` | 🔜 Terjadwal | Pesanan multi-item (`US-11`), alur status (`US-12`), penugasan produksi (`US-13`), output harian (`US-14`), pembayaran DP/pelunasan (`US-15`), **produktivitas per karyawan (`US-16`, sesuai PPT Slide 15)** |
| **Sprint 4** | 7 Des – 20 Des 2026 | 2 minggu *(jadwal PPT)* | `sprint-4` | `v1.0-sprint-4` | 🔜 Terjadwal | Dashboard ringkasan penuh (`US-17`), laporan omzet & bahan bulanan (`US-18`), export Excel/PDF (`US-19`), upload file desain (`US-20`), backup rutin bulanan (NFR Slide 11), bugfix, testing akhir & demo ke pemilik |

## Checklist Progres Rilis
- [x] **Sprint 0 (`v0.0-sprint-0`)** — Setup monorepo, Docker MySQL 8, Prisma, Auth skeleton, CI
- [x] **Sprint 1 (`v0.1-sprint-1`)** — `US-01` s.d. `US-05` (`17 poin`), unit test & Playwright E2E
- [x] **Sprint 2 (`v0.2-sprint-2`)** — `US-06` s.d. `US-10` (`18 poin`, kumulatif `35/76`), desain Figma 17 layar (Desktop & Mobile), deploy produksi `https://rpl.nawf.dev`
- [ ] **Sprint 3 (`v0.3-sprint-3`)** — `US-11` s.d. `US-16` (`25 poin`, kumulatif `60/76`) — target `23 Nov – 6 Des 2026`
- [ ] **Sprint 4 (`v1.0-sprint-4`)** — `US-17` s.d. `US-20` + Backup Rutin & UAT (`16 poin`, kumulatif `76/76`) — target `7 – 20 Des 2026`
