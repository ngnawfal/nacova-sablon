# Sistem Manajemen Operasional Sablon Nacova

Aplikasi operasional internal Sablon Nacova dengan arsitektur terpisah:
- **`backend/`**: REST API Express + TypeScript + Prisma ORM + MySQL 8 + JWT (`jose`) + ExcelJS + `@react-pdf/renderer` (port `4000`).
- **`frontend/`**: SPA Vite + React 19 + TypeScript + React Router + Tailwind v4 + React Hook Form + Zod + TanStack Table + Recharts (port `3000`).

## Menjalankan Secara Lokal

1. Salin environment:
   ```bash
   cp .env.example .env
   cp .env backend/.env
   ```
2. Jalankan MySQL 8 dengan Docker:
   ```bash
   docker compose up -d
   ```
3. Install dependensi & siapkan database:
   ```bash
   npm install
   npm --prefix backend install --legacy-peer-deps
   npm --prefix frontend install --legacy-peer-deps
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```
4. Jalankan backend & frontend sekaligus:
   ```bash
   npm run dev
   ```
   - Front-end (Vite): `http://localhost:3000`
   - Back-end API (Express): `http://localhost:4000/api/health`

### Akun Demo (Seed)
Password semua akun demo: `nacova123`:
- **OWNER**: `owner@nacova.id`
- **ADMIN**: `admin@nacova.id`
- **PRODUCTION**: `produksi@nacova.id`, `budi@nacova.id`

## Pengujian
```bash
npm run typecheck
npm run lint
npm run build
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Struktur Branch Step-by-Step (Scrum)
Lihat [scrum/RELEASE_SCHEDULE.md](scrum/RELEASE_SCHEDULE.md) untuk jadwal lengkap dan panduan merge per sprint:
- `sprint-0` (`v0.0-sprint-0`): Setup awal repo, Docker MySQL, Prisma, Auth skeleton, CI.
- `sprint-1` (`v0.1-sprint-1`): Login RBAC, Karyawan, Absensi & Rekap, Pelanggan (16–18 Nov 2026).
- `sprint-2` (`v0.2-sprint-2`) / **`main`**: Stok Bahan, Mutasi Atomic, Opname, Peringatan Minimum di Dashboard, Izin/Sakit (19–22 Nov 2026).
- `sprint-3` (`v0.3-sprint-3`): Pesanan, Status, Penugasan, Produksi, Pembayaran, Produktivitas Karyawan (23 Nov – 6 Des 2026).
- `sprint-4` (`v1.0-sprint-4`): Dashboard Penuh, Laporan Bulanan, Export Excel/PDF, Upload Desain, Backup Rutin Bulanan (7 – 20 Des 2026).
