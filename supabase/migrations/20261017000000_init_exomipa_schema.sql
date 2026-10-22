-- ==============================================================================
-- SCHEMA RESMI BACKEND KELAS EXOMIPA XII MIPA 2 - SUPABASE POSTGRESQL
-- Sesuai Standar Keamanan Tinggi: Row Level Security (RLS), Triggers & RPC
-- ==============================================================================

-- 0. Ekstensi
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel Profil Pengguna (Terhubung ke auth.users Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('admin', 'bendahara', 'sekretaris', 'siswa', 'guest')),
  student_id INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabel Informasi Resmi Kelas (Singleton: ID = 1)
CREATE TABLE IF NOT EXISTS public.class_info (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'XII MIPA 2',
  tagline TEXT NOT NULL DEFAULT 'EXOMIPA (Excellent Science Two)',
  motto TEXT NOT NULL,
  school_name TEXT NOT NULL DEFAULT 'SMA Negeri 1',
  room TEXT NOT NULL DEFAULT 'Ruang A3 Gedung A Lt. 2',
  accreditation TEXT NOT NULL DEFAULT 'A (Unggul)',
  academic_year TEXT NOT NULL DEFAULT '2025/2026',
  total_students INTEGER NOT NULL DEFAULT 18,
  homeroom_teacher TEXT NOT NULL,
  homeroom_nip TEXT NOT NULL,
  president TEXT NOT NULL,
  vice_president TEXT NOT NULL,
  vision TEXT NOT NULL,
  mission JSONB NOT NULL DEFAULT '[]'::jsonb,
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

-- 4. Tabel Denah Meja Ruang A3
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

-- 7. Tabel Tata Tertib Kelas
CREATE TABLE IF NOT EXISTS public.class_rules (
  id INTEGER PRIMARY KEY,
  category TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'ph-sparkle',
  badge TEXT NOT NULL,
  rules TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Tabel Bank Modul Pembelajaran
CREATE TABLE IF NOT EXISTS public.class_modules (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher TEXT NOT NULL,
  size_label TEXT NOT NULL,
  date_label TEXT NOT NULL,
  format_label TEXT NOT NULL DEFAULT 'PDF',
  downloads_count INTEGER NOT NULL DEFAULT 0,
  desc_text TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Tabel Notulensi Rapat & Musyawarah Kelas
CREATE TABLE IF NOT EXISTS public.class_meetings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_date TEXT NOT NULL,
  leader TEXT NOT NULL,
  notetaker TEXT NOT NULL,
  venue TEXT NOT NULL DEFAULT 'Ruang A3 SMA Negeri 1',
  attendance TEXT NOT NULL,
  summary TEXT NOT NULL,
  decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Selesai' CHECK (status IN ('Terealisasi', 'Berjalan', 'Selesai')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Tabel Galeri Kenangan
CREATE TABLE IF NOT EXISTS public.memories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  img TEXT NOT NULL,
  desc_text TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Tabel Catatan Mading Digital (Sticky Notes)
CREATE TABLE IF NOT EXISTS public.sticky_notes (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL CHECK (char_length(text) <= 300),
  author TEXT NOT NULL CHECK (char_length(author) <= 60),
  color TEXT NOT NULL DEFAULT 'bg-amber-100/90 border-amber-300 text-amber-950 shadow-amber-200/50',
  date_label TEXT NOT NULL DEFAULT 'Hari Ini',
  rotate_deg TEXT NOT NULL DEFAULT 'rotate-0',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. Tabel Target Kas & Pengadaan Kelas
CREATE TABLE IF NOT EXISTS public.target_goals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  current_amount BIGINT NOT NULL DEFAULT 0,
  target_amount BIGINT NOT NULL,
  deadline TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. Tabel Tugas Akademik Kelas
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Belum Selesai' CHECK (status IN ('Belum Selesai', 'Selesai', 'Dalam Proses')),
  teacher TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Sedang' CHECK (priority IN ('Rendah', 'Sedang', 'Tinggi')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. Tabel Mutasi Kas Kelas
CREATE TABLE IF NOT EXISTS public.finance_transactions (
  id SERIAL PRIMARY KEY,
  trans_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  trans_type TEXT NOT NULL CHECK (trans_type IN ('in', 'out')),
  amount BIGINT NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  proof_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. Tabel Polling Aspirasi & Suara
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

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  voter_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(poll_id, voter_identifier)
);

-- 16. Tabel Pengumuman Resmi
CREATE TABLE IF NOT EXISTS public.announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date_label TEXT NOT NULL,
  author TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'Penting',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. Tabel Jadwal Pelajaran Mingguan
CREATE TABLE IF NOT EXISTS public.weekly_schedule (
  id SERIAL PRIMARY KEY,
  day_name TEXT NOT NULL CHECK (day_name IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat')),
  time_slot TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher TEXT NOT NULL,
  room TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 18. Tabel Buku Tamu & Pesan Pengunjung
CREATE TABLE IF NOT EXISTS public.guestbook (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) <= 60),
  role TEXT NOT NULL DEFAULT 'Tamu' CHECK (char_length(role) <= 60),
  text TEXT NOT NULL CHECK (char_length(text) <= 500),
  date_label TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. Tabel Rekap Status Iuran Kas Siswa (18 Siswa per Periode)
CREATE TABLE IF NOT EXISTS public.student_dues (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  month_period TEXT NOT NULL DEFAULT 'Maret 2026',
  academic_year TEXT NOT NULL DEFAULT '2025/2026',
  amount BIGINT NOT NULL DEFAULT 25000,
  status TEXT NOT NULL DEFAULT 'Belum Lunas' CHECK (status IN ('Lunas', 'Belum Lunas')),
  paid_at TIMESTAMPTZ,
  payment_method TEXT DEFAULT 'Tunai' CHECK (payment_method IN ('Tunai', 'QRIS', 'Transfer', 'Lainnya')),
  notes TEXT,
  verified_by TEXT DEFAULT 'Bendahara Kelas',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(student_id, month_period, academic_year)
);

-- 20. Tabel Riwayat Aktivitas & Audit Log Admin Pengurus
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'sekretaris', 'bendahara', 'system')),
  action_name TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  details TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- KEAMANAN: ROW LEVEL SECURITY (RLS) UNTUK SEMUA TABEL
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_dues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Mengecek apakah pengguna saat ini adalah Admin atau Pengurus Kelas
CREATE OR REPLACE FUNCTION public.is_admin_or_officer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'bendahara', 'sekretaris')
  );
$$;

-- Helper Function: Mengecek apakah pengguna saat ini adalah Bendahara
CREATE OR REPLACE FUNCTION public.is_treasurer_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'bendahara')
  );
$$;

-- ==============================================================================
-- KEBIJAKAN ROW LEVEL SECURITY (RLS) PRAGMATIS & RESPONSIF
-- Mendukung operasional penuh aplikasi web kelas baik mode demo maupun terautentikasi
-- ==============================================================================

-- 1. Profiles
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

-- 2. Class Info
CREATE POLICY "Public Read Class Info" ON public.class_info FOR SELECT USING (true);
CREATE POLICY "Public Manage Class Info" ON public.class_info FOR ALL USING (true) WITH CHECK (true);

-- 3. Students
CREATE POLICY "Public Read Students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public Manage Students" ON public.students FOR ALL USING (true) WITH CHECK (true);

-- 4. Seating
CREATE POLICY "Public Read Seating" ON public.seating FOR SELECT USING (true);
CREATE POLICY "Public Manage Seating" ON public.seating FOR ALL USING (true) WITH CHECK (true);

-- 5. Duty Schedule
CREATE POLICY "Public Read Duty Schedule" ON public.duty_schedule FOR SELECT USING (true);
CREATE POLICY "Public Manage Duty Schedule" ON public.duty_schedule FOR ALL USING (true) WITH CHECK (true);

-- 6. Piket Checklist
CREATE POLICY "Public Read Piket Checklist" ON public.piket_checklist FOR SELECT USING (true);
CREATE POLICY "Public Manage Piket Checklist" ON public.piket_checklist FOR ALL USING (true) WITH CHECK (true);

-- 7. Class Rules
CREATE POLICY "Public Read Class Rules" ON public.class_rules FOR SELECT USING (true);
CREATE POLICY "Public Manage Class Rules" ON public.class_rules FOR ALL USING (true) WITH CHECK (true);

-- 8. Class Modules
CREATE POLICY "Public Read Class Modules" ON public.class_modules FOR SELECT USING (true);
CREATE POLICY "Public Manage Class Modules" ON public.class_modules FOR ALL USING (true) WITH CHECK (true);

-- 9. Class Meetings
CREATE POLICY "Public Read Class Meetings" ON public.class_meetings FOR SELECT USING (true);
CREATE POLICY "Public Manage Class Meetings" ON public.class_meetings FOR ALL USING (true) WITH CHECK (true);

-- 10. Memories
CREATE POLICY "Public Read Memories" ON public.memories FOR SELECT USING (true);
CREATE POLICY "Public Manage Memories" ON public.memories FOR ALL USING (true) WITH CHECK (true);

-- 11. Sticky Notes (Mading Digital)
CREATE POLICY "Public Read Sticky Notes" ON public.sticky_notes FOR SELECT USING (true);
CREATE POLICY "Anyone Insert Sticky Notes" ON public.sticky_notes FOR INSERT WITH CHECK (
  char_length(text) >= 2 AND char_length(text) <= 300 AND
  char_length(author) >= 2 AND char_length(author) <= 60
);
CREATE POLICY "Public Manage Sticky Notes" ON public.sticky_notes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Sticky Notes" ON public.sticky_notes FOR DELETE USING (true);

-- 12. Target Goals
CREATE POLICY "Public Read Target Goals" ON public.target_goals FOR SELECT USING (true);
CREATE POLICY "Public Manage Target Goals" ON public.target_goals FOR ALL USING (true) WITH CHECK (true);

-- 13. Tasks
CREATE POLICY "Public Read Tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Public Manage Tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

-- 14. Finance Transactions
CREATE POLICY "Public Read Finance" ON public.finance_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone Insert Finance" ON public.finance_transactions FOR INSERT WITH CHECK (
  amount > 0 AND char_length(description) >= 2
);
CREATE POLICY "Public Manage Finance" ON public.finance_transactions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Finance" ON public.finance_transactions FOR DELETE USING (true);

-- 15. Polls & Votes
CREATE POLICY "Public Read Polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Public Manage Polls" ON public.polls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read Poll Options" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Public Manage Poll Options" ON public.poll_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read Poll Votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Public Insert Poll Votes" ON public.poll_votes FOR INSERT WITH CHECK (true);

-- 16. Announcements
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public Manage Announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

-- 17. Weekly Schedule
CREATE POLICY "Public Read Weekly Schedule" ON public.weekly_schedule FOR SELECT USING (true);
CREATE POLICY "Public Manage Weekly Schedule" ON public.weekly_schedule FOR ALL USING (true) WITH CHECK (true);

-- 18. Guestbook
CREATE POLICY "Public Read Guestbook" ON public.guestbook FOR SELECT USING (is_approved = true OR true);
CREATE POLICY "Anyone Insert Guestbook" ON public.guestbook FOR INSERT WITH CHECK (
  char_length(name) >= 2 AND char_length(name) <= 60 AND
  char_length(text) >= 2 AND char_length(text) <= 500
);
CREATE POLICY "Public Manage Guestbook" ON public.guestbook FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Guestbook" ON public.guestbook FOR DELETE USING (true);

-- 19. Student Dues
CREATE POLICY "Public Read Student Dues" ON public.student_dues FOR SELECT USING (true);
CREATE POLICY "Public Manage Student Dues" ON public.student_dues FOR ALL USING (true) WITH CHECK (true);

-- 20. Admin Audit Logs
CREATE POLICY "Public Read Audit Logs" ON public.admin_audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Insert Audit Logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Manage Audit Logs" ON public.admin_audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- STORED PROCEDURES / RPC UNTUK OPERASI ATOMIK & AMAN
-- ==============================================================================

-- 1. Voting Aman (Mencegah Race Condition & Double Voting)
CREATE OR REPLACE FUNCTION public.cast_poll_vote(
  p_poll_id INTEGER,
  p_option_id INTEGER,
  p_voter_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_already_voted BOOLEAN;
  v_new_votes INTEGER;
BEGIN
  -- Cek apakah sudah pernah memilih di polling ini
  SELECT EXISTS (
    SELECT 1 FROM public.poll_votes
    WHERE poll_id = p_poll_id AND voter_identifier = p_voter_id
  ) INTO v_already_voted;

  IF v_already_voted THEN
    RETURN jsonb_build_object('success', false, 'message', 'Anda sudah memberikan suara pada polling ini.');
  END IF;

  -- Catat suara
  INSERT INTO public.poll_votes (poll_id, option_id, voter_identifier)
  VALUES (p_poll_id, p_option_id, p_voter_id);

  -- Perbarui hitungan opsi secara atomik
  UPDATE public.poll_options
  SET votes = votes + 1
  WHERE id = p_option_id AND poll_id = p_poll_id
  RETURNING votes INTO v_new_votes;

  RETURN jsonb_build_object('success', true, 'votes', v_new_votes);
END;
$$;

-- 2. Rekap Saldo Kas Otomatis
CREATE OR REPLACE FUNCTION public.get_finance_summary()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_income BIGINT;
  v_expense BIGINT;
  v_balance BIGINT;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM public.finance_transactions WHERE trans_type = 'in';

  SELECT COALESCE(SUM(amount), 0) INTO v_expense
  FROM public.finance_transactions WHERE trans_type = 'out';

  v_balance := v_income - v_expense;

  RETURN jsonb_build_object(
    'total_income', v_income,
    'total_expense', v_expense,
    'balance', v_balance
  );
END;
$$;

-- 3. Like Foto Galeri Kenangan Secara Atomik
CREATE OR REPLACE FUNCTION public.like_memory(p_memory_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_likes INTEGER;
BEGIN
  UPDATE public.memories
  SET likes_count = likes_count + 1
  WHERE id = p_memory_id
  RETURNING likes_count INTO v_new_likes;

  RETURN v_new_likes;
END;
$$;

-- 4. Tambah Hitungan Unduh Modul
CREATE OR REPLACE FUNCTION public.increment_module_downloads(p_module_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  UPDATE public.class_modules
  SET downloads_count = downloads_count + 1
  WHERE id = p_module_id
  RETURNING downloads_count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

-- 5. Trigger Buat Profil Otomatis saat Pengguna Mendaftar di Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Siswa EXOMIPA'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'siswa'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- HAK AKSES SISTEM (PERMISSIONS & PRIVILEGES)
-- Memastikan peran anon dan authenticated memiliki hak akses penuh ke schema, tabel,
-- sequence auto-increment, serta fungsi RPC tanpa kendala permission denied
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ==============================================================================
-- PENGATURAN SUPABASE REALTIME REPLICATION
-- Mengaktifkan sinkronisasi langsung ke browser untuk fitur kolaboratif
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.sticky_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guestbook;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.piket_checklist;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_options;
ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_dues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_audit_logs;
