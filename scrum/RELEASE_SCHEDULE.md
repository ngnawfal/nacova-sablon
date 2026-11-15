# Jadwal Rilis Bertahap (Step-by-Step Sprint Schedule)

Dokumen ini memetakan jadwal rilis per sprint sesuai presentasi **Scrum Kick-off Sablon Nacova** (4 sprint) dan target perkuliahan (Sprint 1 & 2 selesai dalam 1 minggu pertama, dilanjutkan Sprint 3 & Sprint 4 masing-masing 2 minggu).

## Peta Branch, Tag & Jadwal

| Sprint | Periode | Durasi | Branch | Tag | Status di `main` | Fitur Utama (Sesuai PPT Slide 13–15) |
|---|---|---|---|---|---|---|
| **Sprint 0** | 15–16 Nov 2026 | Persiapan | `sprint-0` | `v0.0-sprint-0` | Done | Repo `backend/` + `frontend/`, Docker MySQL 8, Prisma awal, Auth skeleton, UI kit, CI & setup Scrum |
| **Sprint 1** | 16–18 Nov 2026 | 3 hari *(bagian 1 minggu S1+S2)* | `sprint-1` | `v0.1-sprint-1` | Done | Login per role (`US-01`), kelola akun karyawan (`US-02`), absen masuk/pulang WIB (`US-03`), rekap absensi bulanan (`US-04`), data pelanggan (`US-05`) |
| **Sprint 2** | 19–22 Nov 2026 | 4 hari *(bagian 1 minggu S1+S2)* | `sprint-2` | `v0.2-sprint-2` | **Done (Aktif di `main` & `https://rpl.nawf.dev`)** | Data bahan & supplier (`US-06`), stok masuk/keluar atomic (`US-07`), peringatan stok minimum merah di Dashboard (`US-08`, AC PPT Slide 15), stock opname (`US-09`), izin/sakit karyawan (`US-10`) |
| **Sprint 3** | 23 Nov – 6 Des 2026 | 2 minggu *(jadwal PPT)* | `sprint-3` | `v0.3-sprint-3` | Terjadwal | Pesanan multi-item (`US-11`), alur status (`US-12`), penugasan produksi (`US-13`), output harian (`US-14`), pembayaran DP/pelunasan (`US-15`), **produktivitas per karyawan (`US-16`, sesuai PPT Slide 15)** |
| **Sprint 4** | 7 Des – 20 Des 2026 | 2 minggu *(jadwal PPT)* | `sprint-4` | `v1.0-sprint-4` | Terjadwal | Dashboard ringkasan penuh (`US-17`), laporan omzet & bahan bulanan (`US-18`), export Excel/PDF (`US-19`), upload file desain (`US-20`), backup rutin bulanan (NFR Slide 11), bugfix, testing akhir & demo ke pemilik |

## Panduan Lanjut ke Sprint Berikutnya

### Saat Masuk / Demo Sprint 3 (23 Nov – 6 Des 2026)
```bash
git checkout main
git merge --no-ff sprint-3 -m "merge(sprint-3): rilis Pesanan, Produksi, dan Produktivitas Karyawan"
npm run db:generate
npm run db:push
npm run db:seed
npm run typecheck && npm run lint && npm run build
npm run test:unit && npm run test:integration && npm run test:e2e
```

### Saat Masuk / Demo Sprint 4 / Final (7 Des – 20 Des 2026)
```bash
git checkout main
git merge --no-ff sprint-4 -m "merge(sprint-4): rilis Dashboard Penuh, Laporan, Export, Upload Desain, dan Backup Rutin"
npm run db:generate
npm run db:push
npm run db:seed
npm run typecheck && npm run lint && npm run build
npm run test:unit && npm run test:integration && npm run test:e2e
```
