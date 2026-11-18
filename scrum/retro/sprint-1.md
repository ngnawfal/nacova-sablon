# Sprint 1 Retrospective (2026-11-18)

**Periode:** 16–18 Nov 2026   **Velocity:** 17 / 17 poin (`US-01` s.d. `US-05` Done)

## Berjalan Baik
- Pemisahan `backend/` (Express + Prisma) dan `frontend/` (Vite + React) mempercepat paralelisasi kerja BE dan FE.
- Aturan waktu WIB (`Asia/Jakarta`) dan RBAC per role tervalidasi sejak awal lewat unit test dan E2E mobile 360px.

## Perlu Diperbaiki
- Kontrak payload API antar BE/FE sempat beberapa kali disesuaikan di tengah jalan.
- Pengelolaan stok pada Sprint 2 berisiko race condition jika tidak diuji dengan integration test transaksi konkuren.

## Aksi Perbaikan (Sprint 2)
1. **Dava & Gading:** Kunci skema Zod mutasi stok (`stock-in`, `stock-out`, `adjust`) di hari pertama Sprint 2.
2. **Risqi & Nakofa:** Siapkan integration test concurrency `$transaction` untuk memastikan stok tidak pernah minus.
3. **Imam & Ilham:** Pastikan peringatan merah stok minimum langsung terlihat di Dashboard (sesuai AC PPT Slide 15).
