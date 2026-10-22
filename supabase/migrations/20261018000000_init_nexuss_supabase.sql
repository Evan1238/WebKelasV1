-- ==============================================================================
-- SCHEMA RESMI BACKEND KELAS NEXUSS X TJKT 1 - SUPABASE POSTGRESQL
-- Institusi: SMK Negeri 1 PBG • Lab Jaringan & Komputer Gedung C Lt. 2
-- Standar Keamanan: Row Level Security (RLS), Realtime Channels & RBAC
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel Akses Role Akun Google Pengurus (RBAC Khusus Email Google)
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'sekretaris', 'bendahara')),
  name TEXT NOT NULL DEFAULT '',
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabel Informasi Resmi Kelas (Singleton: ID = 1)
CREATE TABLE IF NOT EXISTS public.class_info (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'X TJKT 1',
  tagline TEXT NOT NULL DEFAULT 'NEXUSS (Network Experts & United System Specialist)',
  motto TEXT NOT NULL DEFAULT 'Satu Frekuensi, Berjuta Koneksi, Menembus Cakrawala Digital',
  school_name TEXT NOT NULL DEFAULT 'SMK Negeri 1 PBG',
  room TEXT NOT NULL DEFAULT 'Lab Jaringan & Komputer Gedung C Lt. 2',
  accreditation TEXT NOT NULL DEFAULT 'A (Unggul)',
  academic_year TEXT NOT NULL DEFAULT '2025/2026',
  total_students INTEGER NOT NULL DEFAULT 18,
  homeroom_teacher TEXT NOT NULL DEFAULT 'Drs. Suryono, M.Pd.',
  homeroom_nip TEXT NOT NULL DEFAULT '19720415 199802 1 003',
  homeroom_quote TEXT,
  homeroom_avatar TEXT,
  president TEXT NOT NULL DEFAULT 'Budi Wicaksono',
  president_quote TEXT,
  president_avatar TEXT,
  vice_president TEXT NOT NULL DEFAULT 'Siti Rahmawati',
  vice_president_avatar TEXT,
  vision TEXT NOT NULL,
  mission JSONB NOT NULL DEFAULT '[]'::jsonb,
  instagram_url TEXT,
  tiktok_url TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  class_email TEXT DEFAULT 'nexuss.xtjkt1@smkn1pbg.sch.id',
  class_whatsapp TEXT DEFAULT '+62 812-3456-7890',
  admin_pins JSONB NOT NULL DEFAULT '{"superadmin":"1234","sekretaris":"2345","bendahara":"3456"}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabel Data Siswa (18 Siswa Lengkap)
CREATE TABLE IF NOT EXISTS public.students (
  id INTEGER PRIMARY KEY,
  no_absen INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  nick TEXT NOT NULL,
  gender VARCHAR(1) NOT NULL CHECK (gender IN ('L', 'P')),
  role TEXT NOT NULL DEFAULT 'Anggota Kelas',
  avatar TEXT NOT NULL,
  interest TEXT,
  dream TEXT,
  quote TEXT,
  ig TEXT,
  piket_day TEXT NOT NULL CHECK (piket_day IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabel Denah Meja Lab Jaringan & Komputer (20 Posisi)
CREATE TABLE IF NOT EXISTS public.seating (
  id INTEGER PRIMARY KEY,
  row_num INTEGER NOT NULL,
  col_num INTEGER NOT NULL,
  student_id INTEGER REFERENCES public.students(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Tabel Jadwal Piket Kebersihan Harian
CREATE TABLE IF NOT EXISTS public.duty_schedule (
  id SERIAL PRIMARY KEY,
  day_name TEXT NOT NULL UNIQUE CHECK (day_name IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat')),
  student_names TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Tabel Checklist Tugas Piket
CREATE TABLE IF NOT EXISTS public.piket_checklist (
  id SERIAL PRIMARY KEY,
  task TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  time_label TEXT NOT NULL,
  points TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Tabel Tata Tertib Kelas & Laboratorium
CREATE TABLE IF NOT EXISTS public.class_rules (
  id INTEGER PRIMARY KEY,
  category TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'ph-sparkle',
  badge TEXT NOT NULL,
  rules TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Tabel Bank Modul Pembelajaran Kejuruan TJKT
CREATE TABLE IF NOT EXISTS public.class_modules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher TEXT NOT NULL,
  size_label TEXT NOT NULL DEFAULT '1.0 MB',
  date_label TEXT NOT NULL DEFAULT 'Hari Ini',
  format_label TEXT NOT NULL DEFAULT 'PDF',
  downloads_count INTEGER NOT NULL DEFAULT 0,
  desc_text TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Tabel Notulensi Musyawarah Rapat Kelas
CREATE TABLE IF NOT EXISTS public.class_meetings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_date TEXT NOT NULL,
  leader TEXT NOT NULL,
  notetaker TEXT NOT NULL,
  venue TEXT NOT NULL DEFAULT 'Lab Jaringan Gedung C SMK Negeri 1 PBG',
  attendance TEXT NOT NULL DEFAULT '18 Siswa Hadir Lengkap',
  summary TEXT NOT NULL,
  decisions TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Terealisasi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Tabel Galeri Foto Kenangan Angkatan
CREATE TABLE IF NOT EXISTS public.memories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  img TEXT NOT NULL,
  desc_text TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Tabel Mading Virtual Sticky Notes
CREATE TABLE IF NOT EXISTS public.sticky_notes (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-amber-100/90 border-amber-300 text-amber-950',
  date_label TEXT NOT NULL DEFAULT 'Hari Ini',
  rotate_deg TEXT NOT NULL DEFAULT 'rotate-0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. Tabel Target Kas & Pengadaan Fasilitas
CREATE TABLE IF NOT EXISTS public.target_goals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  target_amount NUMERIC(12, 2) NOT NULL,
  deadline TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. Tabel Agenda & Tugas Pelajaran
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  deadline DATE NOT NULL,
  teacher TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Sedang' CHECK (priority IN ('Rendah', 'Sedang', 'Tinggi')),
  status TEXT NOT NULL DEFAULT 'Belum Selesai' CHECK (status IN ('Belum Selesai', 'Selesai')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. Tabel Mutasi Keuangan Kas (Pemasukan & Pengeluaran)
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id SERIAL PRIMARY KEY,
  trans_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  trans_type VARCHAR(3) NOT NULL CHECK (trans_type IN ('in', 'out')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL DEFAULT 'Operasional',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. Tabel Status Iuran Kas 18 Siswa
CREATE TABLE IF NOT EXISTS public.student_dues (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  month_period TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2025/2026',
  amount NUMERIC(10, 2) NOT NULL DEFAULT 25000,
  status TEXT NOT NULL DEFAULT 'Belum Lunas' CHECK (status IN ('Lunas', 'Belum Lunas')),
  paid_at TIMESTAMPTZ,
  payment_method TEXT DEFAULT 'Tunai',
  notes TEXT,
  verified_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (student_id, month_period, academic_year)
);

-- 16. Tabel Audit Log Aktivitas Admin
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'superadmin',
  action_name TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  details TEXT,
  performed_by TEXT NOT NULL DEFAULT 'Pengurus NEXUSS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. Tabel Polling Musyawarah Aspirasi
CREATE TABLE IF NOT EXISTS public.polls (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 18. Tabel Pengumuman Resmi
CREATE TABLE IF NOT EXISTS public.announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date_label TEXT NOT NULL,
  author TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'Penting',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. Tabel Buku Tamu & Aspirasi Publik
CREATE TABLE IF NOT EXISTS public.guestbook (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Tamu',
  text TEXT NOT NULL,
  date_label TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 20. Tabel Jadwal KBM Mingguan
CREATE TABLE IF NOT EXISTS public.weekly_schedule (
  id SERIAL PRIMARY KEY,
  day_name TEXT NOT NULL CHECK (day_name IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat')),
  time_slot TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher TEXT NOT NULL,
  room TEXT NOT NULL DEFAULT 'Lab Jaringan Gedung C',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piket_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_schedule ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Akses Baca Publik Terbuka & Akses Tulis Diizinkan
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public Read All" ON public.%I', tbl);
    EXECUTE format('CREATE POLICY "Public Read All" ON public.%I FOR SELECT USING (true)', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow Full Access" ON public.%I', tbl);
    EXECUTE format('CREATE POLICY "Allow Full Access" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;
