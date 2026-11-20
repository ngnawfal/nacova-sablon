# Sprint 2 Retrospective (2026-11-20)

**Periode:** 19–22 Nov 2026   **Velocity:** 18 / 18 poin (`US-06` s.d. `US-10` Done · Kumulatif **35 / 76 poin**)

## Berjalan Baik
- Target dosen untuk menyelesaikan Sprint 1 & Sprint 2 dalam 1 minggu pertama tercapai dengan kualitas teruji.
- Transaksi `prisma.$transaction` dengan kondisi `currentStock >= qty` berhasil mencegah stok minus pada uji konkuren.
- Acceptance Criteria PPT Slide 15 (*"Tinta Plastisol Putih hampir habis"*) tampil jelas dengan banner merah di Dashboard.

## Perlu Diperbaiki
- Sprint 3 memiliki beban poin terbesar (25 poin: Pesanan multi-item, status, penugasan, output harian, pembayaran, dan produktivitas).
- Perlu disiplin memisahkan fitur Sprint 3 & Sprint 4 per branch agar demo ke dosen tetap bertahap dan bersih.

## Aksi Perbaikan (Sprint 3 — 23 Nov s.d. 6 Des 2026)
1. **Dava & Aan:** Pisahkan validasi Zod `orders` dan aturan bisnis `BR-04..BR-10` sejak hari pertama Sprint 3.
2. **Gading & Reynald:** Uji field array pesanan baru (`/pesanan/baru`) dan grafik produktivitas di desktop & mobile `360px`.
3. **Risqi & Nakofa:** Tambahkan unit test total pesanan (`BR-05`), transisi status (`BR-04`), blokir `DIAMBIL` (`BR-06`), dan batas output (`BR-09`).
