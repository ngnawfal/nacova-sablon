# Spesifikasi Layar — Sprint 1 (Auth, Absensi, Pelanggan)

## 1. `/login` (US-01)
- **Layout**: Kartu terpusat (`max-w-sm`), logo teks Nacova, form email + password, tombol "Masuk" tinggi `48px`.
- **Akun Demo Hint**: Hanya tampil di development (`NODE_ENV !== 'production'`) dengan tombol isi cepat atau info kredensial seed agar QA/tim mudah menguji tanpa hardcode produksi.
- **Error State**: Pesan `"Email atau password salah"` atau `"Akun dinonaktifkan"` tanpa membocorkan detail sensitif.

## 2. `/karyawan` (US-02 — Hanya `OWNER`)
- **Desktop**: Tabel karyawan (Nama, Email, Role, No. HP, Status Aktif/Nonaktif, Aksi Edit / Reset Password / Nonaktifkan).
- **Mobile**: Kartu daftar per karyawan dengan badge role dan tombol aksi.
- **Dialog/Drawer**: Form Tambah/Edit karyawan (Zod: nama, email, role `OWNER|ADMIN|PRODUCTION`, password awal min 6 karakter, telepon) + Reset Password.

## 3. `/absensi` (US-03 — Semua Role)
- **Hero Jam Realtime**: Jam digital `HH:mm:ss WIB` + tanggal lokal Indonesia (`Asia/Jakarta`), informasi batas jam masuk dari `work_settings`.
- **Tombol Utama (NFR-07)**: Satu tombol besar minimal tinggi `72px`, lebar penuh di mobile:
  - Belum absen masuk → `"Absen Masuk"` (oranye aksen).
  - Sudah masuk, belum pulang → `"Absen Pulang"` (gelap `#0F172A`), tampilkan jam masuk & status (`HADIR` / `TERLAMBAT`).
  - Sudah pulang → Kartu ringkasan hari ini (jam masuk, jam pulang, total durasi, status).
  - Izin/Sakit/Cuti → Kartu status izin hari ini (tombol absen dinonaktifkan).
- **Riwayat Pribadi**: 7–14 hari terakhir di bawah tombol utama.

## 4. `/absensi/rekap` (US-04 & US-10 — `OWNER`, `ADMIN`)
- **Filter**: Pilih Bulan & Tahun (default bulan berjalan).
- **Ringkasan + Tabel TanStack**: Kolom Nama, Role, Hadir, Terlambat, Izin/Sakit, Alpa, Total Jam Kerja.
- **Aksi US-10**: Tombol "Catat Izin/Sakit" (pilih karyawan, tanggal, status `IZIN | SAKIT | CUTI`, catatan).

## 5. `/pelanggan` (US-05 — `OWNER`, `ADMIN`)
- **Toolbar**: Input pencarian live/submit (cari nama / no. HP / instansi) + tombol `"Tambah Pelanggan"`.
- **Tabel / Kartu Mobile**: Nama, No. HP/WA, Instansi/Alamat, Jumlah Pesanan, Aksi Edit & Hapus (soft delete dengan konfirmasi).
