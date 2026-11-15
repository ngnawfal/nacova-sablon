# SPRINT PLAN — Sistem Manajemen Operasional Sablon Nacova

> Turunan dari presentasi *Scrum Kick-off Sablon Nacova* (Slide 13–15).
> Struktur: **Sprint 0 (persiapan) + Sprint 1 & 2 dalam 1 minggu pertama + Sprint 3 & 4 masing-masing 2 minggu**. Total backlog **76 poin** (20 user story).

---

## 1. Ringkasan Jadwal

| Sprint | Durasi | Mulai | Selesai | Sprint Goal (ringkas) | Poin | Must / Should / Could |
|---|---|---|---|---|:-:|:-:|
| **0** | Persiapan | 2026-11-15 | 2026-11-16 | Repo `backend/`+`frontend/`, database awal, wireframe siap | – | – |
| **1** | 3 hari *(1 minggu S1+S2)* | 2026-11-16 | 2026-11-18 | Login per role, absensi, pelanggan | 17 | 17 / 0 / 0 |
| **2** | 4 hari *(1 minggu S1+S2)* | 2026-11-19 | 2026-11-22 | Stok bahan aman (tidak pernah minus) + peringatan minimum + izin | 18 | 8 / 10 / 0 |
| **3** | 2 minggu *(jadwal PPT)* | 2026-11-23 | 2026-12-06 | Pesanan sampai diambil + produksi + pembayaran + produktivitas | 25 | 17 / 8 / 0 |
| **4** | 2 minggu *(jadwal PPT)* | 2026-12-07 | 2026-12-20 | Dashboard penuh, laporan bulanan, export, upload desain, backup, UAT | 16 | 5 / 8 / 3 |
| **Total** | ±5 minggu | 2026-11-15 | 2026-12-20 | | **76** | **47 / 26 / 3** |

Catatan penting:
- **Sprint 1 + Sprint 2** digarap dalam **1 minggu penuh (`16–22 Nov 2026`)** agar siap demo 2 sprint tuntas ke dosen minggu depan (`35 / 76` poin Done).
- **Sprint 3 (`23 Nov – 6 Des 2026`)** dan **Sprint 4 (`7 – 20 Des 2026`)** mengikuti ritme **2 minggu per sprint** sesuai PPT Slide 14–15, dan dipisah pada branch Git terpisah (`sprint-3`, `sprint-4`) — lihat `scrum/RELEASE_SCHEDULE.md`.
- **Must = 47 poin** (MVP). Sprint 4 hanya berisi **5 poin Must** (`US-17` Dashboard penuh); sisanya Should/Could + NFR Backup Rutin Bulanan & UAT.

---

## 2. Role & Struktur Tim Scrum

| Role | Anggota Tim | Tanggung jawab |
|---|---|---|
| Product Owner | Naufal | Mengelola dan memprioritaskan backlog, menulis acceptance criteria, menetapkan Sprint Goal, menerima/menolak hasil di Sprint Review |
| Scrum Master | Afkha | Memfasilitasi event Scrum, merangkum Daily Scrum, mencatat dan menyingkirkan hambatan, menjaga Definition of Done |
| UI/UX | Imam, Ilham | Wireframe, design system, prototipe Figma, usability test |
| Back-end | Dava, Aan | REST API Express, auth JWT, aturan bisnis (BR-xx), validasi Zod, transaksi Prisma |
| Front-end | Gading, Reynald | Halaman React, komponen UI, form, tabel, grafik, responsif mobile 360px |
| Database & QA | Risqi, Nacofa | Skema Prisma, migrasi, seed, test case, Vitest/Playwright |

Koordinasi progres dan hambatan dicatat rutin pada papan kerja di direktori `scrum/` (lihat §10).

---

## 3. Ritme Satu Sprint (2 minggu = 14 hari kalender)

| Hari | Event | Durasi | Dipimpin | Output |
|---|---|---|---|---|
| 1 | **Sprint Planning** | 1,5–2 jam | PO (apa), tim (bagaimana) | Sprint Goal + Sprint Backlog (story dan tugas per role) |
| 1–13 | **Daily Scrum** | 15 menit | Scrum Master | `scrum/daily/YYYY-MM-DD.md` |
| 7 | **Backlog Refinement** + cek burndown | 1 jam | PO | Story sprint depan jelas (Definition of Ready) dan sudah diestimasi |
| 13 | **Code freeze** + regression test | – | QA | Tidak ada fitur baru; hanya perbaikan bug |
| 14 | **Sprint Review** | 1 jam | PO | Demo ke PO/pemilik; story diterima atau kembali ke backlog |
| 14 | **Retrospective** | 45 menit | Scrum Master | Maksimal 3 aksi perbaikan untuk sprint berikutnya |

Aturan: story yang **belum memenuhi Definition of Done tidak dapat poin** dan kembali ke Product Backlog untuk dinilai ulang oleh PO.

Desain berjalan **satu sprint di depan**: UI/UX menyiapkan desain sprint N+1 selama sprint N, sehingga Front-end tidak menunggu.

---

## 4. Sprint 0 — Persiapan

**Goal:** Tim siap membangun: repo jalan, skema awal ada, wireframe Sprint 1 selesai.

| Role | Tugas |
|---|---|
| PO | Finalisasi 20 user story + acceptance criteria Given/When/Then; susun Sprint 1 Backlog; jadwalkan wawancara/konfirmasi dengan pemilik Nacova |
| SM | Siapkan board (`scrum/board.md`); sepakati jam Daily Scrum; sepakati DoD dan Definition of Ready |
| UI/UX | Design system (warna, font, komponen); wireframe + prototipe Figma untuk login, absen, rekap, pelanggan |
| Database | `schema.prisma` awal (`users`, `attendances`, `work_settings`, `customers`); MySQL lokal (Docker); `seed.ts` dengan akun demo (OWNER, ADMIN, PRODUCTION) |
| Back-end | Setup Express + TypeScript, auth JWT skeleton, middleware RBAC |
| Front-end | Setup Vite + React + Tailwind v4, layout dasar, template komponen tabel dan form |
| QA | Setup Vitest + Playwright, CI GitHub Actions, template test case |

**Demo:** repo jalan (`npm run dev`), skema awal ter-migrate, wireframe Sprint 1 disetujui PO.

---

## 5. Sprint 1 — Auth, Absensi, Pelanggan (17 poin)

**Sprint Goal:** *Karyawan bisa login sesuai role dan absen dari HP; admin bisa melihat rekap absensi dan mengelola data pelanggan.*

| Story | Poin | Database | Back-end | Front-end | QA |
|---|:-:|---|---|---|---|
| US-01 Login per role | 3 | `users` + enum role; seed akun demo | JWT (`jose`) + cookie httpOnly, bcrypt, RBAC | `/login`, layout sidebar → bottom-nav | E2E login per role; akses ditolak ke halaman terlarang |
| US-02 Kelola akun karyawan | 3 | – | `/api/users`: create, update, deactivate, reset password | `/karyawan` tabel + form (OWNER) | Validasi Zod; hanya OWNER |
| US-03 Absen masuk/pulang | 3 | `attendances` **unique(user_id, date)**; `work_settings` | `check-in`, `check-out`; BR-01, BR-02 | `/absensi`: tombol besar + jam realtime WIB | Unit status TERLAMBAT; E2E absen dua kali ditolak |
| US-04 Rekap absensi bulanan | 5 | Query rekap per bulan | `/api/attendances/recap` (hadir, telat, izin, alpa, total jam; BR-03) | `/absensi/rekap`: TanStack Table + pilih bulan | Unit hitung alpa saat rekap |
| US-05 Data pelanggan | 3 | `customers` + soft delete | `/api/customers`: CRUD + pencarian | `/pelanggan` tabel + pencarian + form | E2E CRUD; soft delete (BR-11) |

**UI/UX (paralel):** desain Sprint 2 (stok: daftar bahan, form mutasi, badge peringatan).
**Demo:** login tiga role, absen dari HP, rekap bulanan, CRUD pelanggan.

---

## 6. Sprint 2 — Stok Bahan (18 poin)

**Sprint Goal:** *Admin bisa mengelola bahan dan mencatat stok masuk, keluar, dan opname dengan aman (stok tidak pernah minus), melihat peringatan stok menipis, dan menginput izin/sakit.*

| Story | Poin | Database | Back-end | Front-end | QA |
|---|:-:|---|---|---|---|
| US-06 Data bahan & stok minimum | 3 | `materials` (kategori, satuan, `min_stock`); `suppliers` | `/api/materials` & `/api/materials/suppliers` CRUD + soft delete | `/stok` tabel + form | E2E CRUD bahan |
| US-07 Stok masuk & keluar | 5 | `stock_movements` (IN/OUT/ADJUST); `current_stock` sebagai cache | `stock-in`, `stock-out` di dalam `prisma.$transaction`; BR-07 | `/stok/mutasi`, `/stok/:id` riwayat | **Integration test:** stok cukup/tidak; dua request bersamaan tidak membuat stok minus |
| US-08 Peringatan stok minimum | 5 | Query stok ≤ minimum | `/api/reports/dashboard` & status `HABIS`/`MENIPIS`/`AMAN` | Badge merah/kuning/hijau, banner merah di dashboard | Uji AC US-08 (tinta putih 2 L, minimum 3 L) |
| US-09 Stock opname | 3 | – | `adjust` wajib `reason`; hanya OWNER/ADMIN; BR-08 | Form penyesuaian | Tolak tanpa alasan; tolak untuk role PRODUCTION |
| US-10 Izin/sakit karyawan | 2 | status izin/sakit/cuti di `attendances` | `/api/attendances/leave` | Form izin di `/absensi/rekap` | Rekap ikut menghitung izin |

**UI/UX (paralel):** desain Sprint 3 (form pesanan multi-item, stepper status, panel pembayaran, "Tugas saya").
**Demo:** mutasi stok, tolak stok tidak cukup, peringatan stok menipis, opname, input izin.

---

## 7. Sprint 3 — Pesanan, Produksi & Produktivitas (25 poin · 23 Nov – 6 Des 2026)

**Sprint Goal:** *Pesanan bisa dicatat dari awal sampai diambil (item & total otomatis, status, penugasan ke karyawan, input output harian, pembayaran DP/pelunasan) serta produktivitas per karyawan terpantau (sesuai PPT Slide 15).*

| Story | Poin | Database | Back-end | Front-end | QA |
|---|:-:|---|---|---|---|
| US-11 Catat pesanan + item | 8 | `orders`, `order_items`; kode `NCV-2026-xxxx` | `POST /api/orders`; total dihitung ulang (BR-05) | `/pesanan`, `/pesanan/baru` (field array) | Unit total: 24×Rp45.000 + 12×Rp50.000 = Rp1.680.000 |
| US-12 Ubah status pesanan | 3 | `order_status_logs` | Alur maju, BATAL sebelum SELESAI (BR-04) + log | Stepper status di `/pesanan/:id` | Status mundur ditolak; log tercatat |
| US-13 Tugaskan ke karyawan | 3 | `order_assignments` | Penugasan karyawan | Panel penugasan | Hanya OWNER/ADMIN |
| US-14 Input output harian | 3 | `production_logs` | Catat output (`qtyDone`, `qtyReject`); BR-09; progres otomatis | `/produksi` "Tugas saya" + form | Unit: total `qty_done` tidak boleh melebihi quantity item |
| US-15 DP & pelunasan | 3 | `payments` | Catat pembayaran; sisa tagihan; blok status DIAMBIL jika sisa > 0 (BR-06) | Panel pembayaran | Unit BR-06 (kecuali override OWNER) |
| US-16 Produktivitas karyawan | 5 | Query agregat `production_logs` | `GET /api/reports/productivity` | `/produksi/produktivitas` grafik + tabel | Unit agregasi output vs reject |

**UI/UX (paralel):** desain Sprint 4 (dashboard penuh, laporan bulanan, backup rutin) + usability test dengan 2–3 pengguna.

---

## 8. Sprint 4 — Dashboard Penuh, Laporan, Backup & UAT (16 poin · 7 – 20 Des 2026)

**Sprint Goal:** *Pemilik punya dashboard penuh, laporan bulanan + export Excel/PDF, upload file desain, dan backup rutin bulanan; sistem lolos UAT dan siap dipakai.*

| Story | Poin | Database | Back-end | Front-end | QA |
|---|:-:|---|---|---|---|
| US-17 Dashboard ringkasan penuh (Must) | 5 | Query ringkasan | Data hadir hari ini, pesanan aktif, deadline dekat (BR-10), stok menipis, pemasukan | `/` kartu + tabel deadline + grafik output (Recharts) | E2E dashboard per role |
| US-18 Laporan omzet & bahan | 5 | Query bulanan | `GET /api/reports/monthly` | `/laporan` | Cocokkan angka dengan data seed |
| US-19 Export Excel/PDF (Could) | 3 | – | `GET /api/reports/export/:type` (exceljs, @react-pdf/renderer) | Tombol export | File terbuka dan isinya benar |
| US-20 Upload file desain | 3 | `order_files` | `POST /api/orders/:id/files` | Uploader di `/pesanan/:id` | Batas ukuran/tipe file |
| NFR Backup rutin bulanan | – | `backup_logs` | `backend/src/routes/backup.ts` + cron bulanan | `/backup` | Integration test snapshot `.json.gz` + export Excel |

**Tugas non-story:** UAT dengan pemilik Nacova (checklist), perbaikan bug, deploy produksi `https://rpl.nawf.dev`, README, seed data demo.

---

## 9. Burndown Ideal & Kapasitas

| Akhir sprint | Tanggal target | Sisa poin (ideal) | Poin selesai kumulatif |
|---|---|:-:|:-:|
| Awal (setelah Sprint 0) | 2026-11-16 | 76 | 0 |
| Sprint 1 | 2026-11-18 | 59 | 17 |
| Sprint 2 | 2026-11-22 | 41 | 35 |
| Sprint 3 | 2026-12-06 | 16 | 60 |
| Sprint 4 | 2026-12-20 | 0 | 76 |

**Jika waktu atau kapasitas kurang — urutan pemotongan (PO memutuskan, Must tidak boleh dipotong):**
1. US-19 Export Excel/PDF (Could, 3)
2. US-20 Upload file desain (Should, 3)
3. US-10 Izin/sakit (Should, 2)
4. US-18 Laporan omzet & bahan (Should, 5)
5. US-16 Produktivitas (Should, 5)

---

## 10. Daily Scrum

**Aturan:** 15 menit, jam tetap (**20:00 WIB**, online), fokus sinkronisasi antar anggota tim.

**Format tiap role:**
1. **Kemarin** — apa yang selesai (sebut ID story/tugas).
2. **Hari ini** — apa yang dikerjakan.
3. **Hambatan** — apa yang menghalangi, dan siapa yang bisa membantu.

---

## 11. Definition of Ready & Definition of Done

**Definition of Ready (story boleh masuk sprint):**
- Ada acceptance criteria Given/When/Then.
- Sudah diestimasi poin (planning poker: 1, 2, 3, 5, 8).
- Desain/wireframe tersedia (untuk story ber-UI).
- Tidak ada dependensi terbuka yang memblokir.
- Disetujui PO.

**Definition of Done:**
kode di-review (PR minimal 1 approve) → lolos test → di-merge ke `main` → ter-deploy ke staging/produksi → acceptance criteria terpenuhi → didokumentasikan.

---

## 12. Hambatan, Perubahan Scope, dan Eskalasi

- **Hambatan:** dicatat di `scrum/impediments.md` (tanggal, pemilik, status). Scrum Master menindaklanjuti dalam 1×24 jam; jika tidak bisa, naikkan ke dosen/pemilik Nacova.
- **Permintaan baru di tengah sprint:** tidak masuk sprint berjalan. Masuk Product Backlog, dinilai PO, dikerjakan di sprint berikutnya.
- **Perubahan Sprint Goal** hanya boleh oleh PO, dan hanya bila goal tidak lagi relevan.
- **Konflik tim:** Scrum Master memfasilitasi; keputusan prioritas tetap di PO.

---

# LAMPIRAN — Template Berkas Papan Scrum (`scrum/`)

- `scrum/board.md` — Sprint Board aktif (`To do → Doing → Review → Done`)
- `scrum/product-backlog.md` — Daftar 20 User Story (`US-01` s.d. `US-20`, 76 poin)
- `scrum/impediments.md` — Log hambatan harian
- `scrum/daily/_TEMPLATE.md` — Template catatan Daily Scrum harian
- `scrum/retro/sprint-N.md` — Ringkasan Retrospective tiap akhir sprint
