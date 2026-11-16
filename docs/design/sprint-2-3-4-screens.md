# Spesifikasi Layar — Sprint 2, 3, dan 4

## Sprint 2: Stok Bahan (`/stok`, `/stok/mutasi`, `/stok/[id]`)
- **`/stok` (US-06, US-08)**: Daftar bahan dengan badge status stok:
  - Merah (`Habis` / `<= 0`) + ikon warning
  - Kuning (`Menipis` / `<= min_stock`) + ikon alert
  - Hijau (`Aman` / `> min_stock`) + ikon check
  - Filter kategori / tampilkan stok menipis saja, kelola supplier, form Tambah/Edit bahan (`OWNER`, `ADMIN`), soft delete. `PRODUCTION` hanya read-only.
- **`/stok/mutasi` (US-07, US-09)**:
  - Tab/pilihan jenis mutasi: `Stok Masuk (IN)`, `Stok Keluar (OUT)`, `Stock Opname (ADJUST)`.
  - Validasi client + server: stok keluar ditolak jika melebihi `current_stock`; `ADJUST` wajib isi `reason` dan hanya `OWNER`/`ADMIN`.
- **`/stok/[id]`**: Ringkasan bahan + riwayat kronologis `stock_movements` (tanggal WIB, tipe, delta, stok sesudah, referensi/alasan, pencatat).

## Sprint 3: Pesanan & Produksi (`/pesanan`, `/pesanan/baru`, `/pesanan/[id]`, `/produksi`)
- **`/pesanan` (US-11)**: Daftar pesanan dengan filter status (`BARU`, `DESAIN`, `PROSES`, `QC`, `SELESAI`, `DIAMBIL`, `BATAL`), pencarian kode `NCV-YYYY-xxxx` atau nama pelanggan, badge deadline dekat/lewat.
- **`/pesanan/baru` (US-11)**: Pilih pelanggan, deadline, catatan; field array item dinamis (nama produk/jenis sablon, ukuran/varian, qty, harga satuan), subtotal dan total tampil live namun dihitung ulang server.
- **`/pesanan/[id]` (US-12, US-13, US-15, US-20)**:
  - **Stepper Status**: Progress visual `BARU → DESAIN → PROSES → QC → SELESAI → DIAMBIL` (+ aksi `BATAL` sebelum `SELESAI`). Blokir `DIAMBIL` jika sisa tagihan > 0 (kecuali checkbox override oleh `OWNER`).
  - **Panel Penugasan**: Tambah/hapus karyawan `PRODUCTION` ke pesanan (`OWNER`/`ADMIN`).
  - **Panel Pembayaran**: Total tagihan, total terbayar, sisa tagihan, form tambah DP/pelunasan (tunai/transfer), riwayat pembayaran.
  - **Uploader File Desain**: Upload PNG/JPG/PDF/SVG/AI/CDR/PSD/ZIP (maks 10MB), daftar file terlampir + link unduh.
  - **Riwayat Status & Produksi**: Log transisi status + log output produksi.
- **`/produksi` (US-14)**:
  - Untuk `PRODUCTION`: daftar "Tugas Saya" (pesanan yang ditugaskan padanya & masih aktif), bar progres `done / target_qty`, form cepat input `qty_done` dan `qty_reject` + catatan.

## Sprint 4: Dashboard, Produktivitas, Laporan (`/`, `/produksi/produktivitas`, `/laporan`)
- **`/` (US-17)**:
  - Kartu KPI: Karyawan Hadir Hari Ini, Pesanan Aktif, Deadline Dekat (<= 2 hari), Bahan Stok Menipis.
  - Tabel pesanan deadline terdekat + daftar stok menipis.
  - Grafik Recharts 30 hari terakhir (pesanan masuk & omzet pembayaran harian).
- **`/produksi/produktivitas` (US-16)**: Filter rentang tanggal, grafik batang output vs reject per karyawan + tabel agregat (`OWNER`, `ADMIN`).
- **`/laporan` (US-18, US-19)**: Filter bulan & tahun, ringkasan omzet pesanan, total pembayaran masuk, pemakaian bahan (OUT), tombol Export Excel (`.xlsx`) dan Export PDF (`.pdf`).
