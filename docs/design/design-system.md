# Design System — Nacova Operational Management

## 1. Tujuan & Konteks Pengguna
- Pengguna lapangan (role `PRODUCTION`) mengakses dari HP Android (`360px` viewport) di area workshop sablon.
- `OWNER` & `ADMIN` memakai desktop/laptop (`1280px+`) untuk rekap, stok, pesanan, dan laporan, serta HP saat inspeksi.
- Prinsip: mobile-first, kontras tinggi (WCAG AA >= 4.5:1), area sentuh minimal `44x44px`, nol status warna-saja (selalu pasangan ikon/teks).

## 2. Palet Warna (2 Core + 1 Accent + Semantik)
- **Background / Surface**: `#F8FAFC` (halaman), `#FFFFFF` (kartu/panel), `#E2E8F0` (border).
- **Teks**: `#0F172A` (utama), `#475569` (sekunder/label).
- **Aksen Utama (Nacova Ink Orange)**: `#C2410C` (tombol primer, active nav, fokus aksi utama; hover `#9A3412`).
- **Semantik** (selalu disertai label teks/ikon):
  - Aman / Hadir / Selesai: `#15803D` bg `#DCFCE7`
  - Peringatan / Terlambat / Stok Menipis: `#B45309` bg `#FEF3C7`
  - Bahaya / Stok Habis / Alpa / Batal: `#B91C1C` bg `#FEE2E2`

## 3. Tipografi & Spasi
- Font UI: `Plus Jakarta Sans` (fallback `system-ui, sans-serif`); angka/kode pesanan/jam: `JetBrains Mono` (`tabular-nums`).
- Radius konsisten: `8px` (`rounded-lg`) untuk kartu & input, `6px` (`rounded-md`) untuk tombol/badge.
- Focus ring wajib terlihat (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C2410C]`).

## 4. Navigasi Responsif
- `< 768px` (`mobile`): Top bar ringkas (judul halaman + badge role) + **Bottom Navigation Bar** fixed (`>= 56px` tinggi, max 5 item sesuai role).
- `>= 768px` (`desktop`): Fixed sidebar `240px` di kiri + konten utama `max-w-7xl`.
- Akses menu per role:
  - `PRODUCTION`: Absensi (`/absensi`), Tugas Saya (`/produksi`), Stok Read-only (`/stok`), Dashboard ringkas (`/`).
  - `ADMIN`: Dashboard (`/`), Absensi & Rekap (`/absensi`, `/absensi/rekap`), Pelanggan (`/pelanggan`), Stok (`/stok`), Pesanan (`/pesanan`), Produksi (`/produksi`).
  - `OWNER`: Semua menu `ADMIN` + Karyawan (`/karyawan`), Laporan (`/laporan`), Produktivitas (`/produksi/produktivitas`).

## 5. State Wajib
Setiap halaman data wajib menyediakan 3 state eksplisit:
1. **Loading**: Skeleton atau indikator muat jelas.
2. **Empty**: Pesan informatif + CTA utama (jika user punya izin).
3. **Error**: Alert inline dengan pesan dari server (contoh: `"Stok tidak cukup"`, `"Kamu sudah absen hari ini"`).
