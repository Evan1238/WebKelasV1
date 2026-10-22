-- ==============================================================================
-- MIGRATION: 20261018010000_add_social_and_site_settings.sql
-- KELAS NEXUSS X TJKT 1 - SMK NEGERI 1 PBG
-- Menambahkan tabel social_links dan site_settings dengan RLS Kebijakan Penuh
-- ==============================================================================

-- 1. TABEL MEDIA SOSIAL KELAS (social_links)
CREATE TABLE IF NOT EXISTS public.social_links (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL,
  label_username TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'ph-link',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index untuk performa sort order
CREATE INDEX IF NOT EXISTS idx_social_links_sort ON public.social_links(sort_order, is_active);

-- Enable RLS
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Kebijakan RLS: Publik bisa membaca (SELECT), Admin bisa kelola penuh (ALL)
DROP POLICY IF EXISTS "Public can view active social links" ON public.social_links;
CREATE POLICY "Public can view active social links" ON public.social_links
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage social links" ON public.social_links;
CREATE POLICY "Admin can manage social links" ON public.social_links
  FOR ALL USING (true) WITH CHECK (true);

-- 2. TABEL PENGATURAN IDENTITAS KELAS GLOBAL (site_settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  brand_name TEXT NOT NULL DEFAULT 'NEXUSS',
  class_name TEXT NOT NULL DEFAULT 'X TJKT 1',
  school_name TEXT NOT NULL DEFAULT 'SMK Negeri 1 PBG',
  academic_year TEXT NOT NULL DEFAULT '2025/2026',
  generation TEXT NOT NULL DEFAULT 'Angkatan 2026',
  room_name TEXT NOT NULL DEFAULT 'Lab Jaringan & Komputer Gedung C Lt. 2',
  accreditation TEXT NOT NULL DEFAULT 'Akreditasi A (Unggul)',
  compactness_pct TEXT NOT NULL DEFAULT '100%',
  motto TEXT NOT NULL DEFAULT 'Satu Hati, Sejuta Karya, Menembus Cakrawala',
  hero_subtitle TEXT NOT NULL DEFAULT 'Gerbang Dokumentasi & Informasi Resmi Siswa-Siswi',
  hero_description TEXT NOT NULL DEFAULT 'Wadah kebersamaan, transparansi akademik, kreativitas kejuruan teknologi informasi, dan catatan perjalanan berharga di SMK Negeri 1 PBG.',
  footer_description TEXT NOT NULL DEFAULT 'Platform web profil dan dokumentasi resmi kelas X TJKT 1 SMK Negeri 1 PBG. Berkomitmen pada transparansi pembukuan kas, keterbukaan informasi akademik, kehangatan mading persahabatan, dan kenangan indah di Lab Jaringan & Komputer.',
  copyright_text TEXT NOT NULL DEFAULT '© 2026 NEXUSS X TJKT 1 SMK Negeri 1 PBG. Seluruh hak cipta dilindungi.',
  audio_title TEXT NOT NULL DEFAULT 'Audio NEXUSS',
  audio_url TEXT NOT NULL DEFAULT '/audio/background.mp3',
  enable_intro_loading BOOLEAN NOT NULL DEFAULT TRUE,
  homeroom_teacher TEXT NOT NULL DEFAULT 'Drs. Suryono, M.Pd.',
  homeroom_nip TEXT NOT NULL DEFAULT '19720415 199802 1 003',
  homeroom_title TEXT NOT NULL DEFAULT 'Pembina & Wali Kelas',
  homeroom_quote TEXT NOT NULL DEFAULT 'Jadilah ahli jaringan dan teknologi yang berintegritas tinggi. Di era digital ini, jaringan kabel dan sistem yang kalian bangun adalah jembatan kemajuan masa depan.',
  homeroom_avatar TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  president_name TEXT NOT NULL DEFAULT 'Budi Wicaksono',
  president_title TEXT NOT NULL DEFAULT 'Ketua Kelas',
  president_quote TEXT NOT NULL DEFAULT 'NEXUSS bukan sekadar kelas X TJKT 1, melainkan rumah kedua tempat kita bertumbuh, berbagi tawa, dan berjuang bersama menguasai teknologi jaringan. Jangan pernah ada yang merasa berjuang sendirian.',
  president_avatar TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  greetings_title TEXT NOT NULL DEFAULT 'Sambutan Wali Kelas & Ketua Kelas',
  greetings_subtitle TEXT NOT NULL DEFAULT 'Untaian kata penyemangat dalam mengarungi tahun pembelajaran di SMK Negeri 1 PBG.',
  philosophy_title TEXT NOT NULL DEFAULT 'Filosofi Nama NEXUSS',
  philosophy_subtitle TEXT NOT NULL DEFAULT 'Network Experts & United System Specialist',
  philosophy_story TEXT NOT NULL DEFAULT 'Nama NEXUSS (Network Experts & United System Specialist) lahir dari tekad 18 siswa kelas X TJKT 1 SMK Negeri 1 PBG untuk membuktikan dedikasi tinggi di bidang teknik jaringan komputer dan telekomunikasi. Lab Jaringan & Komputer di Gedung C menjadi saksi perakitan kabel UTP, konfigurasi router, administrasi server Linux, serta tawa hangat di sela praktikum kejuruan.',
  vision TEXT NOT NULL DEFAULT 'Mewujudkan teknisi dan praktisi jaringan komputer muda yang kompeten, adaptif terhadap inovasi telekomunikasi, berakhlak mulia, dan siap bersaing di industri teknologi global.',
  missions JSONB NOT NULL DEFAULT '["Menguasai kompetensi dasar hingga lanjut dalam perakitan jaringan, routing switching, dan administrasi server.", "Membangun budaya kolaborasi, kedisiplinan kerja tim, dan kepedulian terhadap fasilitas laboratorium komputer.", "Mengikuti sertifikasi industri dan kejuaraan kejuruan bidang IT Network Cabling & System Administration.", "Mempersiapkan lulusan yang siap berkarir profesional di industri jaringan maupun melanjutkan ke perguruan tinggi teknik."]'::jsonb,
  seating_rows INTEGER NOT NULL DEFAULT 5,
  seating_cols INTEGER NOT NULL DEFAULT 4,
  blackboard_label TEXT NOT NULL DEFAULT 'PAPAN TULIS & MEJA GURU - LAB JARINGAN GEDUNG C LT. 2',
  door_label TEXT NOT NULL DEFAULT 'PINTU MASUK KORIDOR',
  window_label TEXT NOT NULL DEFAULT 'JENDELA MENGHADAP TAMAN',
  back_bench_label TEXT NOT NULL DEFAULT 'MEJA FASILITAS & RACK SERVER BELAKANG LAB',
  officers JSONB NOT NULL DEFAULT '{"homeroom": "Drs. Suryono, M.Pd.", "president": "Budi Wicaksono", "vicePresident": "Siti Rahmawati", "secretary1": "Aisyah Nurul", "secretary2": "Putri Handayani", "treasurer1": "Dewi Lestari", "treasurer2": "Nur Halizah", "sections": [{"id": "sec_1", "name": "Seksi Keagamaan & Rohani", "studentNames": ["Aditya Pratama"]}, {"id": "sec_2", "name": "Seksi Keamanan & Ketertiban", "studentNames": ["Fajar Nugraha"]}, {"id": "sec_3", "name": "Seksi Kebersihan & 5R Lab", "studentNames": ["Gilang Ramadhan"]}, {"id": "sec_4", "name": "Seksi Publikasi, Dokumentasi & Medsos", "studentNames": ["Indra Wijaya"]}]}'::jsonb,
  picket_penalty_text TEXT NOT NULL DEFAULT 'Siswa yang tidak hadir piket dikenakan denda kas kelas',
  picket_penalty_amount NUMERIC(12, 2) NOT NULL DEFAULT 5000,
  student_interest_label TEXT NOT NULL DEFAULT 'Minat Kejuruan',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage site settings" ON public.site_settings;
CREATE POLICY "Admin can manage site settings" ON public.site_settings
  FOR ALL USING (true) WITH CHECK (true);

-- 3. SEED INITIAL RECORDS
INSERT INTO public.social_links (platform, label_username, url, icon_name, sort_order, is_active)
VALUES 
  ('Instagram', '@nexuss.xtjkt1', 'https://instagram.com/nexuss.xtjkt1', 'ph-instagram-logo', 1, true),
  ('TikTok', '@nexuss_xtjkt1', 'https://tiktok.com/@nexuss_xtjkt1', 'ph-tiktok-logo', 2, true),
  ('YouTube', '@nexuss_xtjkt1', 'https://youtube.com/@nexuss_xtjkt1', 'ph-youtube-logo', 3, true),
  ('Spotify', 'Playlist Kelas NEXUSS', 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M', 'ph-spotify-logo', 4, true),
  ('Discord', 'Server Komunitas TJKT 1', 'https://discord.gg/nexuss', 'ph-discord-logo', 5, true),
  ('Email', 'nexuss.xtjkt1@smkn1pbg.sch.id', 'mailto:nexuss.xtjkt1@smkn1pbg.sch.id', 'ph-envelope', 6, true),
  ('WhatsApp', 'Kontak WhatsApp Siswa', 'https://wa.me/6281234567890', 'ph-whatsapp-logo', 7, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.site_settings (id, brand_name, class_name, school_name)
VALUES ('main', 'NEXUSS', 'X TJKT 1', 'SMK Negeri 1 PBG')
ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  class_name = EXCLUDED.class_name,
  school_name = EXCLUDED.school_name,
  updated_at = now();
