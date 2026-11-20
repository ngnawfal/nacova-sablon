# Product Backlog

> Sumber: `SPRINT_PLAN.md` dan presentasi *Scrum Kick-off Sablon Nacova* (Slide 13–15). Dikelola oleh `product-owner` (Nawfal).

| ID | User Story | Poin | Prioritas | Target Sprint | Jadwal | Status | Catatan PO |
|---|---|:---:|---|---|---|---|---|
| US-01 | Login per role | 3 | Must | Sprint 1 | 16–18 Nov 2026 | Done | JWT cookie + RBAC (`v0.1-sprint-1`) |
| US-02 | Kelola akun karyawan | 3 | Must | Sprint 1 | 16–18 Nov 2026 | Done | OWNER only |
| US-03 | Absen masuk/pulang | 3 | Must | Sprint 1 | 16–18 Nov 2026 | Done | BR-01, BR-02 WIB |
| US-04 | Rekap absensi bulanan | 5 | Must | Sprint 1 | 16–18 Nov 2026 | Done | BR-03 |
| US-05 | Data pelanggan | 3 | Must | Sprint 1 | 16–18 Nov 2026 | Done | BR-11 soft delete |
| US-06 | Data bahan & stok minimum | 3 | Must | Sprint 2 | 19–22 Nov 2026 | Done | Materials + suppliers (`v0.2-sprint-2`) |
| US-07 | Stok masuk & keluar | 5 | Must | Sprint 2 | 19–22 Nov 2026 | Done | `$transaction` atomic (BR-07) |
| US-08 | Peringatan stok minimum | 5 | Should | Sprint 2 | 19–22 Nov 2026 | Done | AC PPT Slide 15: banner merah Dashboard |
| US-09 | Stock opname | 3 | Should | Sprint 2 | 19–22 Nov 2026 | Done | BR-08 wajib `reason` |
| US-10 | Izin/sakit karyawan | 2 | Should | Sprint 2 | 19–22 Nov 2026 | Done | IZIN / SAKIT / CUTI |
| US-11 | Catat pesanan + item | 8 | Must | Sprint 3 | 23 Nov–6 Des 2026 | Sprint 3 | BR-05 (branch `sprint-3`) |
| US-12 | Ubah status pesanan | 3 | Must | Sprint 3 | 23 Nov–6 Des 2026 | Sprint 3 | BR-04 + log status |
| US-13 | Tugaskan ke karyawan | 3 | Should | Sprint 3 | 23 Nov–6 Des 2026 | Sprint 3 | `order_assignments` |
| US-14 | Input output harian | 3 | Must | Sprint 3 | 23 Nov–6 Des 2026 | Sprint 3 | BR-09 |
| US-15 | DP & pelunasan | 3 | Must | Sprint 3 | 23 Nov–6 Des 2026 | Sprint 3 | BR-06 |
| US-16 | Produktivitas karyawan | 5 | Should | Sprint 3 | 23 Nov–6 Des 2026 | Sprint 3 | Selaras PPT Slide 15 (Sprint 3) |
| US-17 | Dashboard ringkasan penuh | 5 | Must | Sprint 4 | 7–20 Des 2026 | Sprint 4 | BR-10 + Recharts (branch `sprint-4`) |
| US-18 | Laporan omzet & bahan | 5 | Should | Sprint 4 | 7–20 Des 2026 | Sprint 4 | `/laporan` |
| US-19 | Export Excel/PDF | 3 | Could | Sprint 4 | 7–20 Des 2026 | Sprint 4 | ExcelJS + React-PDF |
| US-20 | Upload file desain | 3 | Should | Sprint 4 | 7–20 Des 2026 | Sprint 4 | Lokal `./uploads` + NFR Backup Rutin |

**Total:** 76 poin — **Done: 35 poin (Sprint 1–2)** · **Sisa: 41 poin (Sprint 3–4)**.
