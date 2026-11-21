# Product Backlog

> Sumber: `SPRINT_PLAN.md` dan presentasi *Scrum Kick-off Sablon Nacova* (Slide 13–15). Dikelola oleh **Product Owner (Naufal)**.
> Diperbarui: **2026-11-21**

| ID | User Story | Poin | Prioritas | Target Sprint | Jadwal | Status | Catatan PO |
|---|---|:---:|---|---|---|---|---|
| US-01 | Login per role | 3 | Must | Sprint 1 | 16–18 Nov 2026 | ✅ Done | JWT cookie + RBAC (`v0.1-sprint-1`) |
| US-02 | Kelola akun karyawan | 3 | Must | Sprint 1 | 16–18 Nov 2026 | ✅ Done | OWNER only (`/karyawan`) |
| US-03 | Absen masuk/pulang | 3 | Must | Sprint 1 | 16–18 Nov 2026 | ✅ Done | BR-01, BR-02 WIB (`/absensi`) |
| US-04 | Rekap absensi bulanan | 5 | Must | Sprint 1 | 16–18 Nov 2026 | ✅ Done | BR-03 (`/absensi/rekap`) |
| US-05 | Data pelanggan | 3 | Must | Sprint 1 | 16–18 Nov 2026 | ✅ Done | BR-11 soft delete (`/pelanggan`) |
| US-06 | Data bahan & stok minimum | 3 | Must | Sprint 2 | 19–22 Nov 2026 | ✅ Done | Materials + suppliers (`v0.2-sprint-2`) |
| US-07 | Stok masuk & keluar | 5 | Must | Sprint 2 | 19–22 Nov 2026 | ✅ Done | `$transaction` atomic anti-minus (BR-07) |
| US-08 | Peringatan stok minimum | 5 | Should | Sprint 2 | 19–22 Nov 2026 | ✅ Done | AC PPT Slide 15: banner merah Dashboard |
| US-09 | Stock opname | 3 | Should | Sprint 2 | 19–22 Nov 2026 | ✅ Done | BR-08 wajib `reason` |
| US-10 | Izin/sakit karyawan | 2 | Should | Sprint 2 | 19–22 Nov 2026 | ✅ Done | IZIN / SAKIT / CUTI |
| US-11 | Catat pesanan + item | 8 | Must | Sprint 3 | 23 Nov–6 Des 2026 | ⬜ To Do | BR-05 hitung total otomatis |
| US-12 | Ubah status pesanan | 3 | Must | Sprint 3 | 23 Nov–6 Des 2026 | ⬜ To Do | BR-04 + log riwayat status |
| US-13 | Tugaskan ke karyawan | 3 | Should | Sprint 3 | 23 Nov–6 Des 2026 | ⬜ To Do | `order_assignments` |
| US-14 | Input output harian | 3 | Must | Sprint 3 | 23 Nov–6 Des 2026 | ⬜ To Do | BR-09 batas output produksi |
| US-15 | DP & pelunasan | 3 | Must | Sprint 3 | 23 Nov–6 Des 2026 | ⬜ To Do | BR-06 blokir DIAMBIL sebelum lunas |
| US-16 | Produktivitas karyawan | 5 | Should | Sprint 3 | 23 Nov–6 Des 2026 | ⬜ To Do | Selaras PPT Slide 15 (Sprint 3) |
| US-17 | Dashboard ringkasan penuh | 5 | Must | Sprint 4 | 7–20 Des 2026 | ⬜ To Do | BR-10 deadline + Recharts |
| US-18 | Laporan omzet & bahan | 5 | Should | Sprint 4 | 7–20 Des 2026 | ⬜ To Do | `/laporan` bulanan |
| US-19 | Export Excel/PDF | 3 | Could | Sprint 4 | 7–20 Des 2026 | ⬜ To Do | ExcelJS + React-PDF |
| US-20 | Upload file desain | 3 | Should | Sprint 4 | 7–20 Des 2026 | ⬜ To Do | Lokal `./uploads` + NFR Backup Rutin |

**Ringkasan:** `76 poin` total — **`✅ Done: 35 poin (Sprint 1–2)`** · **`⬜ Sisa: 41 poin (Sprint 3–4)`**
