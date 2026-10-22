# Panduan Lengkap Sistem Backend Supabase - Portal Resmi EXOMIPA XII MIPA 2

Dokumen ini menjelaskan arsitektur, keamanan, dan panduan pemasangan sistem backend berbasis **Supabase (PostgreSQL)** untuk portal kelas XII MIPA 2. Sistem ini dirancang dengan prinsip **aman, terstruktur, berperforma tinggi, dan tahan terhadap gangguan offline (graceful fallback)**.

---

## 1. Arsitektur & Keunggulan Sistem

- **Database PostgreSQL:** Relasional dengan integritas data yang ketat (`FOREIGN KEY`, `CHECK constraints`, `UNIQUE`, `JSONB`).
- **Row Level Security (RLS) Aktif:** Seluruh tabel dilindungi RLS sehingga pengguna anonim hanya memiliki hak akses baca dan kirim data terbatas (buku tamu, sticky notes mading) dengan validasi panjang teks di level database.
- **Stored Procedure Atomik (RPC):** Fungsi `cast_poll_vote` mencegah race condition dan pemilihan ganda (*duplicate voting*) dengan mencatat *voter identifier*.
- **Realtime Replication:** Pembaruan mading digital, buku tamu, pengumuman, dan checklist piket disiarkan langsung ke seluruh siswa yang sedang membuka web tanpa perlu me-refresh halaman.
- **Penyimpanan Ganda & Offline Resilience:** Aplikasi secara cerdas beralih menggunakan *LocalStorage* browser jika Supabase belum dikonfigurasi atau ketika jaringan terputus, sehingga web tidak akan pernah *crash* atau blank.

---

## 2. Struktur Tabel Database

| Nama Tabel | Fungsi & Konten | Hak Akses RLS |
| :--- | :--- | :--- |
| `class_info` | Profil resmi, visi misi, data wali kelas & ketua kelas | Baca: Publik, Edit: Pengurus |
| `students` | Direktori 18 siswa (No Absen, minat, cita-cita, kutipan) | Baca: Publik, Edit: Pengurus |
| `seating` | Denah meja belajar Ruang A3 (5 baris x 4 kolom) | Baca: Publik, Edit: Pengurus |
| `duty_schedule` | Jadwal piket kebersihan harian (Senin - Jumat) | Baca: Publik, Edit: Pengurus |
| `piket_checklist` | Daftar periksa tugas piket harian (sapu, pel, spidol) | Baca: Publik, Centang: Publik |
| `class_rules` | 5 bab tata tertib kelas, sanksi edukatif, denda kas | Baca: Publik, Edit: Pengurus |
| `class_modules` | Bank modul materi pelajaran (PDF, ringkasan, soal) | Baca: Publik, Unggah: Publik/Pengurus |
| `class_meetings` | Notulensi rapat musyawarah (jaket, bukber, evaluasi) | Baca: Publik, Tambah: Pengurus |
| `memories` | Galeri momen kebersamaan dan foto kegiatan kelas | Baca: Publik, Unggah: Publik |
| `sticky_notes` | Catatan mading digital interaktif | Baca: Publik, Kirim: Publik |
| `target_goals` | Target pendanaan kas (buku tahunan, kipas, jaket) | Baca: Publik, Edit: Bendahara/Pengurus |
| `tasks` | Agenda tugas akademik, deadline, & skala prioritas | Baca: Publik, Centang/Ubah: Publik |
| `finance_transactions` | Mutasi kas kelas transparan (pemasukan & pengeluaran) | Baca: Publik, Catat: Bendahara |
| `polls` & `poll_options` | Angket aspirasi siswa & hitungan suara real-time | Baca: Publik, Suara: 1x per perangkat |
| `announcements` | Papan pengumuman resmi dari wali kelas & pengurus | Baca: Publik, Buat: Pengurus |
| `weekly_schedule` | Jadwal KBM mingguan lengkap dengan ruang belajar | Baca: Publik, Edit: Pengurus |
| `guestbook` | Buku tamu & testimoni pengunjung/alumni | Baca: Publik, Kirim: Publik |
| `profiles` | Sinkronisasi akun Supabase Auth dengan hak akses peran | Khusus Pengguna Terdaftar |

---

## 3. Langkah Demi Langkah Pemasangan Backend

### Langkah 1: Buat Proyek Baru di Supabase
1. Kunjungi [https://supabase.com](https://supabase.com) dan buat akun (gratis).
2. Klik **New Project**, tentukan nama proyek (misal: `exomipa-backend`), buat sandi database yang kuat, dan pilih region terdekat (misal: `Singapore`).
3. Tunggu 1-2 menit hingga status database aktif.

### Langkah 2: Jalankan Skrip Skema & Keamanan
1. Buka menu **SQL Editor** pada panel navigasi kiri Supabase Dashboard.
2. Klik tombol **New query**.
3. Buka file `supabase/migrations/20261017000000_init_exomipa_schema.sql` di proyek ini, salin seluruh kodenya, lalu tempelkan ke editor Supabase.
4. Klik tombol **Run**. Seluruh tabel, fungsi keamanan RLS, dan trigger database akan dibuat secara otomatis.

### Langkah 3: Masukkan Data Awal (Seed Data)
1. Buat query baru di **SQL Editor**.
2. Buka file `supabase/seed.sql`, salin kodenya, dan tempelkan ke editor Supabase.
3. Klik tombol **Run**. Data awal 18 siswa, jadwal piket, denah, aturan kelas, modul, dan catatan mading langsung terisi dengan rapi.

### Langkah 4: Buat Storage Bucket (Opsional untuk Dokumen & Foto)
1. Buka menu **Storage** di Supabase Dashboard.
2. Klik **New bucket**:
   - `class-documents` (Public: Aktif) untuk file materi PDF.
   - `class-gallery` (Public: Aktif) untuk foto dokumentasi kegiatan.
   - `finance-receipts` (Public: Aktif) untuk nota bukti pengeluaran kas.

---

## 4. Cara Menghubungkan Frontend Web ke Supabase

### Melalui Antarmuka Web (Paling Praktis)
1. Buka website kelas di browser: `http://localhost:3000/app.html`.
2. Klik tombol **Status Backend** di bagian atas navbar atau footer (berlabel "Mode Data: Lokal / Supabase").
3. Masukkan:
   - **Project URL:** didapat dari *Supabase Dashboard > Settings > API > Project URL* (contoh: `https://xyzproject.supabase.co`).
   - **Anon Public Key:** didapat dari *Supabase Dashboard > Settings > API > Project API Keys > `anon` `public`*.
4. Klik **Uji & Sambungkan**. Sistem akan memvalidasi koneksi secara instan!
5. **Fitur Diagnostik & Seeder Otomatis:**
   - Klik **Cek Tabel** untuk memeriksa status 17 tabel PostgreSQL dan total baris data di cloud.
   - Jika database cloud baru dan masih kosong, klik tombol **Inisialisasi Data Default ke Cloud**. Seluruh data 18 siswa, denah meja, jadwal piket, modul, dan kas akan diunggah otomatis langsung dari browser tanpa perlu membuka SQL editor lagi!

### Melalui File Konfigurasi (Opsional)
Anda juga dapat menyalin `.env.example` menjadi `.env` atau menyetel variabel global di browser:
```javascript
window.EXOMIPA_SUPABASE_URL = "https://your-project-id.supabase.co";
window.EXOMIPA_SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

---

## 5. Ringkasan Keamanan

- **Zero Exposure of Secret Keys:** Web frontend hanya menggunakan *Anon Key*. Kunci rahasia *Service Role* tidak pernah disimpan atau dipublikasikan di kode klien.
- **Proteksi Spam:** Pemasukan data ke tabel `guestbook` dan `sticky_notes` dibatasi oleh *database check constraints* untuk menghindari muatan kosong atau payload berlebihan.
- **Integritas Keuangan:** Mutasi kas memiliki saldo yang selalu terverifikasi secara matematis melalui fungsi `get_finance_summary()`.
