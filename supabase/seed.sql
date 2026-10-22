-- ==============================================================================
-- SEED DATA RESMI KELAS NEXUSS X TJKT 1 - SUPABASE POSTGRESQL
-- Institusi: SMK Negeri 1 PBG • Lab Jaringan & Komputer Gedung C Lt. 2
-- ==============================================================================

-- 1. Akses Role Akun Google Pengurus
INSERT INTO public.admin_roles (id, email, role, name)
VALUES 
  (1, 'admin@smkn1pbg.sch.id', 'superadmin', 'Budi Wicaksono (Ketua Kelas)'),
  (2, 'sekretaris@smkn1pbg.sch.id', 'sekretaris', 'Aisyah Nurul & Putri Handayani'),
  (3, 'bendahara@smkn1pbg.sch.id', 'bendahara', 'Dewi Lestari & Nur Halizah')
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  updated_at = now();

-- 2. Data Informasi Resmi Kelas
INSERT INTO public.class_info (
  id, name, tagline, motto, school_name, room, accreditation, academic_year,
  total_students, homeroom_teacher, homeroom_nip, homeroom_quote, homeroom_avatar,
  president, president_quote, president_avatar, vice_president, vice_president_avatar,
  vision, mission, instagram_url, tiktok_url, youtube_url, spotify_url, class_email, class_whatsapp, admin_pins
)
VALUES (
  1,
  'X TJKT 1',
  'NEXUSS (Network Experts & United System Specialist)',
  'Satu Frekuensi, Berjuta Koneksi, Menembus Cakrawala Digital',
  'SMK Negeri 1 PBG',
  'Lab Jaringan & Komputer Gedung C Lt. 2',
  'A (Unggul)',
  '2025/2026',
  18,
  'Drs. Suryono, M.Pd.',
  '19720415 199802 1 003',
  'Jadilah ahli jaringan dan teknologi yang berintegritas tinggi. Di era digital ini, jaringan kabel dan sistem yang kalian bangun adalah jembatan kemajuan masa depan.',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  'Budi Wicaksono',
  'NEXUSS bukan sekadar kelas X TJKT 1, melainkan rumah kedua tempat kita bertumbuh, berbagi tawa, dan berjuang bersama menguasai teknologi jaringan. Jangan pernah ada yang merasa berjuang sendirian.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'Siti Rahmawati',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  'Mewujudkan teknisi dan praktisi jaringan komputer muda yang kompeten, adaptif terhadap inovasi telekomunikasi, berakhlak mulia, dan siap bersaing di industri teknologi global.',
  '[
    "Menguasai kompetensi dasar hingga lanjut dalam perakitan jaringan, routing switching, dan administrasi server.",
    "Membangun budaya kolaborasi, kedisiplinan kerja tim, dan kepedulian terhadap fasilitas laboratorium komputer.",
    "Mengikuti sertifikasi industri dan kejuaraan kejuruan bidang IT Network Cabling & System Administration.",
    "Mempersiapkan lulusan yang siap berkarir profesional di industri jaringan maupun melanjutkan ke perguruan tinggi teknik."
  ]'::jsonb,
  'https://instagram.com/nexuss.xtjkt1',
  'https://tiktok.com/@nexuss_xtjkt1',
  'https://youtube.com/@nexuss_xtjkt1',
  'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
  'nexuss.xtjkt1@smkn1pbg.sch.id',
  '+62 812-3456-7890',
  '{"superadmin":"1234","sekretaris":"2345","bendahara":"3456"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  motto = EXCLUDED.motto,
  school_name = EXCLUDED.school_name,
  room = EXCLUDED.room,
  vision = EXCLUDED.vision,
  mission = EXCLUDED.mission,
  updated_at = now();

-- 3. Data 18 Siswa Lengkap
INSERT INTO public.students (id, no_absen, name, nick, gender, role, avatar, interest, dream, quote, ig, piket_day)
VALUES
(1, 1, 'Aditya Pratama', 'Adit', 'L', 'Anggota Kelas', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80', 'Infrastruktur Jaringan & Fiber Optik', 'Network Engineer Cisco', 'Teknologi yang baik adalah teknologi yang menghubungkan dan mempermudah hidup manusia.', '@adit_pratama', 'Senin'),
(2, 2, 'Aisyah Nurul', 'Aisyah', 'P', 'Sekretaris 1', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'Cloud Architecture & DevOps', 'DevOps Engineer AWS', 'Otomasi dan keandalan sistem adalah kunci transformasi teknologi modern.', '@aisyah_nurul', 'Senin'),
(3, 3, 'Budi Wicaksono', 'Budi', 'L', 'Ketua Kelas', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', 'Cyber Security & Network Defense', 'Cyber Security Specialist', 'Pemimpin sejati melayani dan merangkul semua orang untuk maju bersama.', '@budi_wicaksono', 'Senin'),
(4, 4, 'Citra Kirana', 'Citra', 'P', 'Anggota Kelas', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', 'Linux System Administration & Server', 'System Administrator RedHat', 'Stabilitas server berawal dari konfigurasi yang teliti dan disiplin.', '@citra_kirana', 'Senin'),
(5, 5, 'Dewi Lestari', 'Dewi', 'P', 'Bendahara 1', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', 'Database Administration & Big Data', 'Database Architect Oracle', 'Kejujuran dan ketelitian mencatat adalah pilar integritas hidup.', '@dewi_lestari', 'Selasa'),
(6, 6, 'Fajar Nugraha', 'Fajar', 'L', 'Sie Kebersihan', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', 'Wireless Networking & IoT', 'IoT Specialist Telkom', 'Lab yang bersih dan tertata melahirkan koneksi sistem yang stabil.', '@fajar_nugraha', 'Selasa'),
(7, 7, 'Gilang Ramadhan', 'Gilang', 'L', 'Sie Olahraga', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80', 'Hardware Komputer & Network Cabling', 'Hardware & Cabling Specialist', 'Mens sana in corpore sano, di dalam tubuh yang sehat terdapat jiwa yang kuat.', '@gilang_ramadhan', 'Selasa'),
(8, 8, 'Hana Althafunnisa', 'Hana', 'P', 'Anggota Kelas', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80', 'Telekomunikasi & Transmisi Satelit', 'Telco Engineer Lintasarta', 'Komunikasi yang jernih dan data yang cepat membuka peluang tanpa batas.', '@hana_althaf', 'Selasa'),
(9, 9, 'Irfan Hakim', 'Irfan', 'L', 'Anggota Kelas', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80', 'Routing Switching & BGP Protocol', 'Senior Network Architect', 'Setiap paket data punya rute terbaik, seperti setiap impian punya jalannya.', '@irfan_hakim', 'Rabu'),
(10, 10, 'Jasmine Aurelia', 'Jasmine', 'P', 'Sie Mading', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', 'UI/UX Design & Web Frontend', 'Product Designer Tech Unicorn', 'Teknologi dan estetika berpadu menghadirkan pengalaman pengguna terbaik.', '@jasmine_aurelia', 'Rabu'),
(11, 11, 'Kevin Jonathan', 'Kevin', 'L', 'Anggota Kelas', 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&w=600&q=80', 'Network Automation & Python Scripting', 'Site Reliability Engineer Google', 'Setiap masalah berulang selalu bisa diotomasi dengan baris kode efisien.', '@kevin_jonathan', 'Rabu'),
(12, 12, 'Larasati Sekar', 'Laras', 'P', 'Anggota Kelas', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', 'Virtualisasi & Cloud Computing', 'Cloud Infrastructure Specialist', 'Inovasi tanpa batas dimulai dari pemanfaatan komputasi awan yang cerdas.', '@larasati_sekar', 'Rabu'),
(13, 13, 'Muhammad Rizky', 'Rizky', 'L', 'Anggota Kelas', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80', 'MikroTik Certified Network & ISP', 'ISP Network Manager Biznet', 'Bandwidth stabil dan latensi rendah adalah kunci kepuasan pengguna.', '@rizky_muhammad', 'Kamis'),
(14, 14, 'Naufal Irsyad', 'Naufal', 'L', 'Anggota Kelas', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80', 'Datacenter Infrastructure & Server Hardware', 'Datacenter Specialist Equinix', 'Fondasi dunia digital berpijak pada keandalan infrastruktur fisik datacenter.', '@naufal_irsyad', 'Kamis'),
(15, 15, 'Nur Halizah', 'Halizah', 'P', 'Bendahara 2', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', 'IT Project Management & FinTech', 'IT Project Director Mandiri', 'Transparansi menciptakan rasa saling percaya yang kokoh di antara kita.', '@nur_halizah', 'Kamis'),
(16, 16, 'Putri Handayani', 'Putri', 'P', 'Sekretaris 2', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80', 'Dokumentasi Sistem IT & Standarisasi ISO', 'IT Quality Assurance Lead', 'Dokumentasi rapi adalah nyawa dari pemeliharaan sistem jangka panjang.', '@putri_handayani', 'Kamis'),
(17, 17, 'Rehan Maulana', 'Rehan', 'L', 'Sie Dokumentasi', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80', 'Digital Media & Computer Graphics', 'Creative Tech Lead Tokopedia', 'Satu foto dan video menyimpan seribu memori kebersamaan yang tak lekang waktu.', '@rehan_maulana', 'Jumat'),
(18, 18, 'Siti Rahmawati', 'Siti', 'P', 'Wakil Ketua Kelas', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80', 'Network Security & Firewall Administration', 'Security Analyst Cyber Army', 'Keamanan informasi melindungi privasi dan integritas masa depan kita.', '@siti_rahma', 'Jumat')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  interest = EXCLUDED.interest,
  dream = EXCLUDED.dream,
  quote = EXCLUDED.quote,
  piket_day = EXCLUDED.piket_day,
  updated_at = now();

-- 4. Denah Meja Lab Jaringan (20 Meja)
INSERT INTO public.seating (id, row_num, col_num, student_id)
VALUES
(1, 1, 1, 1),
(2, 1, 2, 2),
(3, 1, 3, 3),
(4, 1, 4, 4),
(5, 2, 1, 5),
(6, 2, 2, 6),
(7, 2, 3, 7),
(8, 2, 4, 8),
(9, 3, 1, 9),
(10, 3, 2, 10),
(11, 3, 3, 11),
(12, 3, 4, 12),
(13, 4, 1, 13),
(14, 4, 2, 14),
(15, 4, 3, 15),
(16, 4, 4, 16),
(17, 5, 1, 17),
(18, 5, 2, 18),
(19, 5, 3, NULL),
(20, 5, 4, NULL)
ON CONFLICT (id) DO UPDATE SET
  student_id = EXCLUDED.student_id,
  updated_at = now();


-- 5. Tabel Media Sosial Kelas Resmi
INSERT INTO public.social_links (id, platform, label_username, url, icon_name, sort_order, is_active)
VALUES
  (1, 'Instagram', '@nexuss.xtjkt1', 'https://instagram.com/nexuss.xtjkt1', 'ph-instagram-logo', 1, true),
  (2, 'TikTok', '@nexuss_xtjkt1', 'https://tiktok.com/@nexuss_xtjkt1', 'ph-tiktok-logo', 2, true),
  (3, 'Discord', 'Server Komunitas TJKT 1', 'https://discord.gg/nexuss', 'ph-discord-logo', 3, true),
  (4, 'Email', 'nexuss.xtjkt1@smkn1pbg.sch.id', 'mailto:nexuss.xtjkt1@smkn1pbg.sch.id', 'ph-envelope', 4, true)
ON CONFLICT (id) DO UPDATE SET
  platform = EXCLUDED.platform,
  label_username = EXCLUDED.label_username,
  url = EXCLUDED.url,
  icon_name = EXCLUDED.icon_name,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 6. Tabel Pengaturan Identitas Global (site_settings)
INSERT INTO public.site_settings (
  id, brand_name, class_name, school_name, academic_year, generation,
  room_name, accreditation, compactness_pct, motto, hero_subtitle, hero_description,
  footer_description, copyright_text, audio_title, audio_url, enable_intro_loading,
  homeroom_teacher, homeroom_nip, homeroom_title, homeroom_quote, homeroom_avatar,
  president_name, president_title, president_quote, president_avatar,
  greetings_title, greetings_subtitle, philosophy_title, philosophy_subtitle, philosophy_story,
  vision, missions, seating_rows, seating_cols, blackboard_label, door_label, window_label,
  back_bench_label, officers, picket_penalty_text, picket_penalty_amount, student_interest_label
)
VALUES (
  'main',
  'NEXUSS',
  'X TJKT 1',
  'SMK Negeri 1 PBG',
  '2025/2026',
  'Angkatan 2026',
  'Lab Jaringan & Komputer Gedung C Lt. 2',
  'Akreditasi A (Unggul)',
  '100%',
  'Satu Hati, Sejuta Karya, Menembus Cakrawala',
  'Gerbang Dokumentasi & Informasi Resmi Siswa-Siswi',
  'Wadah kebersamaan, transparansi akademik, kreativitas kejuruan teknologi informasi, dan catatan perjalanan berharga di SMK Negeri 1 PBG.',
  'Platform web profil dan dokumentasi resmi kelas X TJKT 1 SMK Negeri 1 PBG. Berkomitmen pada transparansi pembukuan kas, keterbukaan informasi akademik, kehangatan mading persahabatan, dan kenangan indah di Lab Jaringan & Komputer.',
  '© 2026 NEXUSS X TJKT 1 SMK Negeri 1 PBG. Seluruh hak cipta dilindungi.',
  'Audio NEXUSS',
  '/audio/background.mp3',
  true,
  'Drs. Suryono, M.Pd.',
  '19720415 199802 1 003',
  'Pembina & Wali Kelas',
  'Jadilah ahli jaringan dan teknologi yang berintegritas tinggi. Di era digital ini, jaringan kabel dan sistem yang kalian bangun adalah jembatan kemajuan masa depan.',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  'Budi Wicaksono',
  'Ketua Kelas',
  'NEXUSS bukan sekadar kelas X TJKT 1, melainkan rumah kedua tempat kita bertumbuh, berbagi tawa, dan berjuang bersama menguasai teknologi jaringan. Jangan pernah ada yang merasa berjuang sendirian.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'Sambutan Wali Kelas & Ketua Kelas',
  'Untaian kata penyemangat dalam mengarungi tahun pembelajaran di SMK Negeri 1 PBG.',
  'Filosofi Nama NEXUSS',
  'Network Experts & United System Specialist',
  'Nama NEXUSS (Network Experts & United System Specialist) lahir dari tekad 18 siswa kelas X TJKT 1 SMK Negeri 1 PBG untuk membuktikan dedikasi tinggi di bidang teknik jaringan komputer dan telekomunikasi. Lab Jaringan & Komputer di Gedung C menjadi saksi perakitan kabel UTP, konfigurasi router, administrasi server Linux, serta tawa hangat di sela praktikum kejuruan.',
  'Mewujudkan teknisi dan praktisi jaringan komputer muda yang kompeten, adaptif terhadap inovasi telekomunikasi, berakhlak mulia, dan siap bersaing di industri teknologi global.',
  '["Menguasai kompetensi dasar hingga lanjut dalam perakitan jaringan, routing switching, dan administrasi server.", "Membangun budaya kolaborasi, kedisiplinan kerja tim, dan kepedulian terhadap fasilitas laboratorium komputer.", "Mengikuti sertifikasi industri dan kejuaraan kejuruan bidang IT Network Cabling & System Administration.", "Mempersiapkan lulusan yang siap berkarir profesional di industri jaringan maupun melanjutkan ke perguruan tinggi teknik."]'::jsonb,
  5,
  4,
  'PAPAN TULIS & MEJA GURU - LAB JARINGAN GEDUNG C LT. 2',
  'PINTU MASUK KORIDOR',
  'JENDELA MENGHADAP TAMAN',
  'MEJA FASILITAS & RACK SERVER BELAKANG LAB',
  '{"homeroom": "Drs. Suryono, M.Pd.", "president": "Budi Wicaksono", "vicePresident": "Siti Rahmawati", "secretary1": "Aisyah Nurul", "secretary2": "Putri Handayani", "treasurer1": "Dewi Lestari", "treasurer2": "Nur Halizah", "sections": [{"id": "sec_1", "name": "Seksi Keagamaan & Rohani", "studentNames": ["Aditya Pratama"]}, {"id": "sec_2", "name": "Seksi Keamanan & Ketertiban", "studentNames": ["Fajar Nugraha"]}, {"id": "sec_3", "name": "Seksi Kebersihan & 5R Lab", "studentNames": ["Gilang Ramadhan"]}, {"id": "sec_4", "name": "Seksi Publikasi, Dokumentasi & Medsos", "studentNames": ["Indra Wijaya"]}]}'::jsonb,
  'Siswa yang tidak hadir piket dikenakan denda kas kelas',
  5000,
  'Minat Kejuruan'
)
ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  class_name = EXCLUDED.class_name,
  school_name = EXCLUDED.school_name,
  updated_at = now();


-- ============================================================================
-- SEED DATA TAHAP 2: Pengaturan Kas Kelas & Moderasi Konten Publik
-- ============================================================================

INSERT INTO public.cash_settings (
  id, monthly_dues, active_period, financial_status_label, initial_balance
)
VALUES (
  'main', 25000, 'Bulan Oktober 2026', 'Status Keuangan Sehat', 0
)
ON CONFLICT (id) DO UPDATE SET
  monthly_dues = EXCLUDED.monthly_dues,
  active_period = EXCLUDED.active_period,
  financial_status_label = EXCLUDED.financial_status_label,
  updated_at = now();

-- Pastikan pesan sticky notes dan guestbook default berstatus approved
UPDATE public.sticky_notes SET is_approved = TRUE, status = 'approved' WHERE is_approved IS NULL OR status IS NULL;
UPDATE public.guestbook SET is_approved = TRUE, status = 'approved' WHERE is_approved IS NULL OR status IS NULL;

-- ============================================================================
-- 8. Transaksi Kas Kelas (finance_transactions)
-- ============================================================================
INSERT INTO public.finance_transactions (id, trans_date, description, trans_type, amount, category)
VALUES
  (2, '2026-03-04', 'Pembelian Spidol Whiteboard & Penghapus', 'out', 65000, 'Alat Tulis'),
  (3, '2026-03-08', 'Biaya Pengadaan Isi Ulang Galon Air & Kebersihan', 'out', 45000, 'Operasional'),
  (4, '2026-03-12', 'Penggantian Biaya Cetak Format Ujian Mandiri', 'out', 80000, 'Akademik'),
  (6, '2026-10-01', 'Pemasukan Kas Awal Semester Ganjil TA 2026/2027', 'in', 1500000, 'Kas Masuk'),
  (7, '2026-10-05', 'Penerimaan Iuran Kas Bulan Oktober (16 Siswa Lunas)', 'in', 400000, 'Iuran Siswa')
ON CONFLICT (id) DO UPDATE SET
  trans_date = EXCLUDED.trans_date,
  description = EXCLUDED.description,
  trans_type = EXCLUDED.trans_type,
  amount = EXCLUDED.amount,
  category = EXCLUDED.category;

-- ============================================================================
-- 9. Status Iuran Siswa (student_dues)
-- ============================================================================
INSERT INTO public.student_dues (id, student_id, month_period, academic_year, amount, status, payment_method, verified_by)
VALUES
  (11, 9, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (15, 10, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (1, 11, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (16, 12, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (13, 13, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (14, 14, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (17, 15, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (18, 16, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (2, 17, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (20, 18, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (43, 1, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Dewi Lestari (Bendahara 1)'),
  (4, 2, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (5, 3, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (6, 4, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (7, 5, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (8, 6, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (9, 7, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)'),
  (10, 8, 'Bulan Oktober 2026', '2026/2027', 25000, 'Lunas', 'Tunai', 'Budi Wicaksono (Ketua Kelas)')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  amount = EXCLUDED.amount,
  payment_method = EXCLUDED.payment_method,
  verified_by = EXCLUDED.verified_by,
  updated_at = now();

-- ============================================================================
-- 10. Target Tabungan Kas (target_goals)
-- ============================================================================
INSERT INTO public.target_goals (id, title, current_amount, target_amount, deadline, completed)
VALUES
  (4, 'Buku Kenangan & Yearbook Angkatan NEXUSS', 1800000, 3500000, 'Mei 2026', FALSE),
  (5, 'Jaket Angkatan Resmi X TJKT 1', 3100000, 4200000, 'Juni 2026', FALSE),
  (6, 'Kunjungan Industri & Eksplorasi Jaringan', 2500000, 5000000, 'Agustus 2026', FALSE),
  (7, 'tes', 0, 1000000, 'april 2027', FALSE)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  current_amount = EXCLUDED.current_amount,
  target_amount = EXCLUDED.target_amount,
  deadline = EXCLUDED.deadline,
  completed = EXCLUDED.completed;

-- ============================================================================
-- 11. Modul Pembelajaran TJKT (class_modules)
-- ============================================================================
INSERT INTO public.class_modules (id, title, subject, teacher, size_label, date_label, format_label, downloads_count, desc_text)
VALUES
  (2, 'Modul Dasar Jaringan Komputer, Kabel UTP & IPv4 Subnetting', 'Dasar-dasar TJKT', 'Drs. Suryono, M.Pd.', '2.4 MB', '08 Okt 2026', 'PDF', 52, 'Panduan lengkap standar kabel T568A/T568B, pengkabelan Straight-Through vs Crossover, dan rumus pembagian subnet IP kelas A, B, C.'),
  (3, 'Panduan Praktikum Routing, Switching & Cisco Packet Tracer', 'Routing & Switching', 'Agus Santoso, M.Kom.', '3.8 MB', '05 Okt 2026', 'PDF', 67, 'Koleksi topologi lab, konfigurasi VLAN, Static Route, OSPF, dan DHCP Relay langkah demi langkah.'),
  (4, 'Administrasi Server Linux Ubuntu / Debian & Web Server Nginx', 'Administrasi Server', 'Rina Wijaya, S.Kom.', '1.9 MB', '01 Okt 2026', 'PDF', 41, 'Langkah instalasi CLI server, SSH secure remote access, web server Nginx/Apache, dan DNS Server Bind9.'),
  (5, 'Kisi-Kisi Asesmen Standar Kompetensi Kejuruan TJKT Semester Ganjil', 'Kompetensi Kejuruan IT', 'Tim Kurikulum SMK Negeri 1 PBG', '950 KB', '26 Sep 2026', 'PDF', 78, 'Cakupan indikator soal teori kejuruan dan rubrik penilaian uji unjuk kerja praktikum jaringan kelas X TJKT 1.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subject = EXCLUDED.subject,
  teacher = EXCLUDED.teacher,
  desc_text = EXCLUDED.desc_text;

-- ============================================================================
-- 12. Notulensi Rapat Kelas (class_meetings)
-- ============================================================================
INSERT INTO public.class_meetings (id, title, meeting_date, leader, notetaker, venue, attendance, summary, decisions, status)
VALUES
  (1, 'Musyawarah Pemilihan Desain & Konveksi Jaket Angkatan NEXUSS', '14 Okt 2026', 'Kevin Jonathan (Ketua Panitia)', 'Putri Handayani (Sekretaris 2)', 'Lab Jaringan Gedung C Lt. 2', '18 Siswa + Wali Kelas', 'Membahas penetapan vendor konveksi dan desain final jaket angkatan kelas X TJKT 1. Diputuskan warna dasar Midnight Navy berbahan fleece tebal dengan bordir logo NEXUSS dan nama panggilan di dada.', '["Harga satuan jaket disepakati Rp 165.000 per siswa dengan kualitas bordir komputer premium.","Sistem pembayaran dicicil 2 tahap via Bendahara Dewi Lestari & Nur Halizah.","Sampel ukuran (size chart) diedarkan oleh Seksi Perlengkapan mulai hari Senin depan."]'::jsonb, 'Terealisasi'),
  (2, 'Rapat Koordinasi Bakti Sosial & Kunjungan Industri IT', '07 Okt 2026', 'Budi Wicaksono (Ketua Kelas)', 'Aisyah Nurul (Sekretaris 1)', 'Lab Komputer Gedung C', '18 Siswa', 'Penyusunan kepanitiaan bakti sosial kebersihan fasilitas lab komputer sekolah dan rencana penyerahan paket sembako untuk teknisi serta staf penjaga sekolah.', '["Acara gotong royong perawatan lab jaringan diadakan Sabtu pekan depan.","Menu takjil dan konsumsi dikoordinasikan oleh Bendahara Dewi dan Nur Halizah.","Alokasi anggaran sukarela Rp 20.000 per siswa untuk paket sembako staf kebersihan sekolah."]'::jsonb, 'Berjalan'),
  (3, 'Evaluasi Kebersihan Lab TJKT 1 & Laporan Kas Periode Berjalan', '28 Sep 2026', 'Drs. Suryono, M.Pd. (Wali Kelas)', 'Putri Handayani (Sekretaris 2)', 'Lab Jaringan Gedung C Lt. 2', '18 Siswa', 'Apresiasi dari pihak SMK Negeri 1 PBG atas predikat Lab Terbersih dan pengesahan laporan mutasi pembukuan kas kelas X TJKT 1.', '["Pembelian spidol isi ulang dan penghapus magnetik baru disetujui sebesar Rp 65.000.","Regu piket hari Jumat ditambah koordinasi pemeriksaan jendela dan kabel jaringan sebelum akhir pekan.","Saldo kas periode berjalan dinyatakan transparan, tertib, dan sehat."]'::jsonb, 'Selesai')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  decisions = EXCLUDED.decisions,
  status = EXCLUDED.status;

-- ============================================================================
-- 13. Galeri Foto Kenangan (memories) - Native Database Images
INSERT INTO public.memories (id, title, event_date, img, desc_text, likes_count)
VALUES
  (1, 'Praktikum Perakitan Jaringan & Krimping Kabel Lab TJKT 1', '14 Sep 2026', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgODAwIDUwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZWE1ODBjIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOWEzNDEyIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0idXJsKCNncmFkKSIvPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI2dyaWQpIi8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAwLCAyMDApIj4KICAgIDxjaXJjbGUgcj0iNzUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxwYXRoIGQ9Ik0tMzAsLTI1IEwzMCwtMjUgTDMwLDI1IEwtMzAsMjUgWiBNLTIwLC0xNSBMLTIwLDE1IE0tMTAsLTE1IEwtMTAsMTUgTTAsLTE1IEwwLDE1IE0xMCwtMTUgTDEwLDE1IE0yMCwtMTUgTDIwLDE1IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSI0NSIgc3Ryb2tlPSIjZmVkN2FhIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjYgNCIgZmlsbD0ibm9uZSIvPgogIDwvZz4KICA8cmVjdCB4PSI1MCIgeT0iMzQwIiB3aWR0aD0iNzAwIiBoZWlnaHQ9IjExMCIgcng9IjE2IiBmaWxsPSJyZ2JhKDE1LCAyMywgNDIsIDAuNzUpIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iNDAwIiB5PSIzODAiIGZpbGw9IiNmZmZmZmYiIGZvbnQtc2l6ZT0iMjIiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjkwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgbGV0dGVyLXNwYWNpbmc9IjAuNSI+UFJBS1RJS1VNIEtSSU1QSU5HIEtBQkVMIFVUUCBDQVQ2ICZhbXA7IExBTiBURVNURVI8L3RleHQ+CiAgPHRleHQgeD0iNDAwIiB5PSI0MTUiIGZpbGw9IiNmOTczMTYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjcwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgbGV0dGVyLXNwYWNpbmc9IjEiPk5FWFVTUyBYIFRKS1QgMSDigKIgU01LIE5FR0VSSSAxIFBCRzwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9IjQzNSIgZmlsbD0iI2NiZDVlMSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QZW5ndWppYW4gU3VzdW5hbiBLYWJlbCBTdHJhaWdodCAmYW1wOyBDcm9zcyBkaSBMYWIgSmFyaW5nYW4gR2VkdW5nIEM8L3RleHQ+Cjwvc3ZnPg==', 'Siswa X TJKT 1 mempraktikkan pengupasan kabel UTP Cat6, susunan warna T568B, dan pengetesan redaman sinyal bersama Pak Suryono.', 29),
  (2, 'Juara 1 Turnamen Futsal Antarkelas Porseni Sekolah', '05 Okt 2026', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgODAwIDUwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDI4NGM3Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDM2OWExIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0idXJsKCNncmFkKSIvPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI2dyaWQpIi8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAwLCAyMDApIj4KICAgIDxjaXJjbGUgcj0iNzUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxwYXRoIGQ9Ik0tMjUsLTMwIEwyNSwtMzAgTDIwLDAgQzE1LDI1IDAsMzUgMCwzNSBDMCwzNSAtMTUsMjUgLTIwLDAgWiBNLTM1LC0yMCBMLTI1LC0yMCBNMjUsLTIwIEwzNSwtMjAgTTAsMzUgTDAsNDUgTS0xNSw0NSBMMTUsNDUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIzLjUiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICAgPGNpcmNsZSBjeD0iMCIgY3k9Ii04IiByPSI4IiBmaWxsPSIjZmFjYzE1Ii8+CiAgPC9nPgogIDxyZWN0IHg9IjUwIiB5PSIzNDAiIHdpZHRoPSI3MDAiIGhlaWdodD0iMTEwIiByeD0iMTYiIGZpbGw9InJnYmEoMTUsIDIzLCA0MiwgMC43NSkiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSI0MDAiIHk9IjM4MCIgZmlsbD0iI2ZmZmZmZiIgZm9udC1zaXplPSIyMiIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iOTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBsZXR0ZXItc3BhY2luZz0iMC41Ij5KVUFSQSAxIFRVUk5BTUVOIEZVVFNBTCBQT1JTRU5JIFNFS09MQUg8L3RleHQ+CiAgPHRleHQgeD0iNDAwIiB5PSI0MTUiIGZpbGw9IiNmOTczMTYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjcwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgbGV0dGVyLXNwYWNpbmc9IjEiPk5FWFVTUyBYIFRKS1QgMSDigKIgU01LIE5FR0VSSSAxIFBCRzwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9IjQzNSIgZmlsbD0iI2NiZDVlMSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QcmVzdGFzaSBNZW1iYW5nZ2FrYW4gZGFuIEtlYmVyc2FtYWFuIFRpbSBBbmdrYXRhbiBORVhVU1M8L3RleHQ+Cjwvc3ZnPg==', 'Kemenangan membanggakan kelas X TJKT 1 NEXUSS pada turnamen futsal porseni sekolah yang penuh kebersamaan.', 54),
  (3, 'Instalasi Rack Server & Manajemen Patch Panel Lab', '20 Sep 2026', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgODAwIDUwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMGQ5NDg4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTE1ZTU5Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0idXJsKCNncmFkKSIvPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI2dyaWQpIi8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAwLCAyMDApIj4KICAgIDxjaXJjbGUgcj0iNzUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxyZWN0IHg9Ii0zNSIgeT0iLTM1IiB3aWR0aD0iNzAiIGhlaWdodD0iMjAiIHJ4PSIzIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMi41IiBmaWxsPSJub25lIi8+CiAgIDxyZWN0IHg9Ii0zNSIgeT0iLTEwIiB3aWR0aD0iNzAiIGhlaWdodD0iMjAiIHJ4PSIzIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMi41IiBmaWxsPSJub25lIi8+CiAgIDxyZWN0IHg9Ii0zNSIgeT0iMTUiIHdpZHRoPSI3MCIgaGVpZ2h0PSIyMCIgcng9IjMiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyLjUiIGZpbGw9Im5vbmUiLz4KICAgPGNpcmNsZSBjeD0iMjAiIGN5PSItMjUiIHI9IjMiIGZpbGw9IiM0YWRlODAiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjAiIHI9IjMiIGZpbGw9IiM0YWRlODAiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjI1IiByPSIzIiBmaWxsPSIjNGFkZTgwIi8+CiAgPC9nPgogIDxyZWN0IHg9IjUwIiB5PSIzNDAiIHdpZHRoPSI3MDAiIGhlaWdodD0iMTEwIiByeD0iMTYiIGZpbGw9InJnYmEoMTUsIDIzLCA0MiwgMC43NSkiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSI0MDAiIHk9IjM4MCIgZmlsbD0iI2ZmZmZmZiIgZm9udC1zaXplPSIyMiIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iOTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBsZXR0ZXItc3BhY2luZz0iMC41Ij5JTlNUQUxBU0kgUkFDSyBTRVJWRVIgJmFtcDsgTUFOQUpFTUVOIFBBVENIIFBBTkVMPC90ZXh0PgogIDx0ZXh0IHg9IjQwMCIgeT0iNDE1IiBmaWxsPSIjZjk3MzE2IiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI3MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGxldHRlci1zcGFjaW5nPSIxIj5ORVhVU1MgWCBUSktUIDEg4oCiIFNNSyBORUdFUkkgMSBQQkc8L3RleHQ+CiAgPHRleHQgeD0iNDAwIiB5PSI0MzUiIGZpbGw9IiNjYmQ1ZTEiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UGVuYXRhYW4gS2FiZWwgTWFuYWplbWVuLCBTd2l0Y2ggTWFuYWdlYWJsZSwgZGFuIFNlcnZlciBMaW51eDwvdGV4dD4KPC9zdmc+', 'Praktikum manajemen tata letak kabel jaringan (cable management), switch manageable, dan rack server di Lab Komputer SMK Negeri 1 PBG.', 42),
  (4, 'Kunjungan Industri Datacenter & Fiber Optic NOC', '28 Sep 2026', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgODAwIDUwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNGY0NmU1Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzczMGEzIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0idXJsKCNncmFkKSIvPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI2dyaWQpIi8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDAwLCAyMDApIj4KICAgIDxjaXJjbGUgcj0iNzUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxwYXRoIGQ9Ik0tMzAsMTAgQy0zNSwwIC0yMCwtMjUgMCwtMjUgQzE1LC0yNSAyNSwtMTAgMzAsMCBDNDAsNSAzNSwyNSAyMCwyNSBMLTIwLDI1IEMtMzUsMjUgLTQwLDE1IC0zMCwxMCBaIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPgogICA8Y2lyY2xlIGN4PSItMTAiIGN5PSI1IiByPSIzIiBmaWxsPSIjYTViNGZjIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSI1IiByPSIzIiBmaWxsPSIjYTViNGZjIi8+CiAgPC9nPgogIDxyZWN0IHg9IjUwIiB5PSIzNDAiIHdpZHRoPSI3MDAiIGhlaWdodD0iMTEwIiByeD0iMTYiIGZpbGw9InJnYmEoMTUsIDIzLCA0MiwgMC43NSkiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIiBzdHJva2Utd2lkdGg9IjEiLz4KICA8dGV4dCB4PSI0MDAiIHk9IjM4MCIgZmlsbD0iI2ZmZmZmZiIgZm9udC1zaXplPSIyMiIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iOTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBsZXR0ZXItc3BhY2luZz0iMC41Ij5LVU5KVU5HQU4gSU5EVVNUUkkgREFUQUNFTlRFUiAmYW1wOyBGSUJFUiBPUFRJQyBOT0M8L3RleHQ+CiAgPHRleHQgeD0iNDAwIiB5PSI0MTUiIGZpbGw9IiNmOTczMTYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjcwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgbGV0dGVyLXNwYWNpbmc9IjEiPk5FWFVTUyBYIFRKS1QgMSDigKIgU01LIE5FR0VSSSAxIFBCRzwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9IjQzNSIgZmlsbD0iI2NiZDVlMSIgZm9udC1zaXplPSIxMiIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Fa3NwbG9yYXNpIFRla25vbG9naSBKYXJpbmdhbiBTa2FsYSBFbnRlcnByaXNlIGRhbiBLb21wdXRhc2kgQXdhbjwvdGV4dD4KPC9zdmc+', 'Mempelajari server rack enterprise, fiber optic termination, dan Network Operation Center (NOC) bersama praktisi industri telekomunikasi.', 38)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  img = EXCLUDED.img,
  desc_text = EXCLUDED.desc_text,
  likes_count = EXCLUDED.likes_count;

-- ============================================================================
-- 14. Polling Suara Siswa (polls & poll_options)
-- ============================================================================
INSERT INTO public.polls (id, question, active)
VALUES
  (1, 'Pilihan Desain & Warna Dasar untuk Jaket Angkatan NEXUSS X TJKT 1:', TRUE)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  active = EXCLUDED.active;

INSERT INTO public.poll_options (id, poll_id, text, votes, sort_order)
VALUES
  (2, 1, 'Dark Forest Green dengan Tipografi Emas', 5, 2),
  (3, 1, 'Charcoal Grey Monokromatik Minimalis', 2, 3),
  (1, 1, 'Midnight Navy dengan Aksen Putih Perak', 12, 1)
ON CONFLICT (id) DO UPDATE SET
  text = EXCLUDED.text,
  votes = EXCLUDED.votes,
  sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- 15. Tata Tertib Kelas (class_rules)
-- ============================================================================
INSERT INTO public.class_rules (id, category, icon, badge, rules, sort_order)
VALUES
  (1, 'Kedisiplinan & Waktu Kehadiran', 'ph-clock', 'Disiplin', '["Seluruh siswa wajib hadir di Lab TJKT 1 paling lambat pukul 06.45 WIB untuk persiapan tadarus Al-Quran atau doa bersama.","Siswa yang izin ke luar kelas saat KBM wajib melapor ke guru pengampu dan mengenakan kalung izin kelas (maksimal 2 orang bergantian).","Keterlambatan lebih dari 15 menit tanpa surat keterangan resmi dari orang tua wajib melapor ke guru piket sekolah."]'::jsonb, 1),
  (2, 'Kerapian & Atribut Seragam Sekolah', 'ph-t-shirt', 'Kerapian', '["Mengenakan seragam lengkap sesuai hari: Senin-Selasa Putih Abu-abu berdasi, Rabu Pramuka Lengkap, Kamis Batik Sekolah, Jumat Olahraga / Busana Muslim.","Sepatu hitam polos bertali dengan kaus kaki putih minimal 10 cm di atas mata kaki.","Rambut siswa putra dipotong rapi (tidak menyentuh kerah baju dan telinga), siswi berjilbab wajib mengenakan ciput rapi."]'::jsonb, 2),
  (3, 'Ketertiban Belajar & Penggunaan Gawai', 'ph-device-mobile', 'Fokus Belajar', '["Smartphone wajib dimasukkan ke dalam loker gawai dinding kelas sebelum bel pelajaran berbunyi.","Penggunaan laptop hanya diperkenankan untuk keperluan materi pembelajaran, presentasi, atau instruksi guru yang mengajar.","Dilarang bermain game, membuka media sosial non-edukasi, atau mengenakan earphone saat kegiatan belajar mengajar berlangsung."]'::jsonb, 3),
  (4, 'Kebersihan & Pemeliharaan Sarana Kelas', 'ph-sparkle', 'Lingkungan', '["Dilarang makan makanan berat di dalam kelas saat jam belajar berlangsung.","Kolong meja belajar wajib bebas sampah plastik atau kertas sebelum meninggalkan kelas di jam kepulangan.","Setiap kerusakan fasilitas kelas (spidol, kipas angin, stopkontak, jendela) wajib segera dilaporkan ke Seksi Perlengkapan."]'::jsonb, 4),
  (5, 'Sanksi Edukatif & Denda Kas Kebersihan', 'ph-scales', 'Konsekuensi', '["Siswa yang lalai melaksanakan jadwal piket kebersihan dikenakan denda kas kelas Rp 5.000 dan wajib piket pengganti pada hari berikutnya.","Pelanggaran tata tertib 3 kali berturut-turut akan ditindaklanjuti melalui musyawarah pembinaan bersama Wali Kelas Drs. Suryono, M.Pd.","Seluruh dana denda keterlambatan/piket langsung dialokasikan untuk pengadaan perlengkapan kebersihan dan operasional Lab TJKT 1."]'::jsonb, 5)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  badge = EXCLUDED.badge,
  rules = EXCLUDED.rules,
  sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- 16. Jadwal Piket Harian (duty_schedule)
-- ============================================================================
INSERT INTO public.duty_schedule (id, day_name, student_names)
VALUES
  (1, 'Senin', '["Aditya Pratama","Aisyah Nurul","Citra Kirana"]'::jsonb),
  (2, 'Selasa', '["Dewi Lestari","Fajar Nugraha","Hana Althafunnisa"]'::jsonb),
  (3, 'Rabu', '["Irfan Hakim","Jasmine Aurelia","Larasati Sekar"]'::jsonb),
  (4, 'Kamis', '["Muhammad Rizky","Naufal Irsyad","Putri Handayani"]'::jsonb),
  (5, 'Jumat', '["Rehan Maulana","Siti Rahmawati","Budi Wicaksono"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  student_names = EXCLUDED.student_names;

-- ============================================================================
-- 17. Jadwal Pelajaran Mingguan (weekly_schedule)
-- ============================================================================
INSERT INTO public.weekly_schedule (id, day_name, time_slot, subject, teacher, room, sort_order)
VALUES
  (44, 'Senin', '07.00 - 07.45', 'Upacara Bendera Khidmat', 'Pembina Upacara', 'Lapangan Utama', 0),
  (45, 'Senin', '07.45 - 09.15', 'Dasar-dasar TJKT (Teori Jaringan)', 'Drs. Suryono, M.Pd.', 'Lab TJKT 1', 0),
  (46, 'Senin', '09.30 - 11.00', 'Pemrograman Dasar & Web', 'Ahmad Fauzi, S.Kom.', 'Lab Komputer Gedung C', 0),
  (47, 'Senin', '11.00 - 12.30', 'Bahasa Indonesia', 'Dra. Nurul Huda', 'Lab TJKT 1', 0),
  (48, 'Senin', '13.00 - 14.30', 'Pendidikan Agama & Budi Pekerti', 'Drs. H. Mulyadi', 'Lab TJKT 1 / Musholla', 0),
  (49, 'Selasa', '07.00 - 08.30', 'Sistem Komputer & Hardware', 'Rina Wijaya, S.Pd.', 'Lab Hardware', 0),
  (50, 'Selasa', '08.30 - 10.00', 'Praktikum Jaringan Kabel & Fiber Optik', 'Drs. Suryono, M.Pd.', 'Lab Jaringan Gedung C', 0),
  (51, 'Selasa', '10.15 - 11.45', 'Bahasa Inggris Komunikasi Teknis', 'Sarah Mitchell, M.Ed.', 'Lab Bahasa', 0),
  (52, 'Selasa', '12.30 - 14.00', 'Matematika Terapan Kejuruan', 'Agus Santoso, M.Si.', 'Lab TJKT 1', 0),
  (53, 'Rabu', '07.00 - 08.30', 'Praktikum Routing & Switching', 'Ahmad Fauzi, S.Kom.', 'Lab Jaringan Gedung C', 0),
  (54, 'Rabu', '08.30 - 10.00', 'Sejarah Indonesia', 'Bambang Triyono, M.Hum.', 'Lab TJKT 1', 0),
  (55, 'Rabu', '10.15 - 11.45', 'Dasar Telekomunikasi & Radio Frekuensi', 'Drs. Suryono, M.Pd.', 'Lab TJKT 1', 0),
  (56, 'Rabu', '12.30 - 14.00', 'Pendidikan Pancasila', 'Hendra Setiawan, S.Pd.', 'Lab TJKT 1', 0),
  (57, 'Kamis', '07.00 - 08.30', 'Administrasi Server Linux', 'Rina Wijaya, S.Pd.', 'Lab Komputer Gedung C', 0),
  (58, 'Kamis', '08.30 - 10.00', 'Keamanan Jaringan & Cyber Basic', 'Ahmad Fauzi, S.Kom.', 'Lab Jaringan Gedung C', 0),
  (59, 'Kamis', '10.15 - 11.45', 'Seni Budaya & Projek Kreatif', 'Indah Kusuma, S.Sn.', 'Ruang Desain', 0),
  (60, 'Kamis', '12.30 - 14.00', 'Bimbingan Konseling & Karir IT', 'Dra. Sri Wahyuni', 'Lab TJKT 1', 0),
  (61, 'Jumat', '06.45 - 07.30', 'Senam Pagi & Literasi Digital', 'Tim Olahraga Sekolah', 'Lapangan Utama', 0),
  (62, 'Jumat', '07.30 - 09.00', 'Pendidikan Jasmani & Kesehatan', 'Fajar Nugroho, S.Pd.', 'Gedung Olahraga', 0),
  (63, 'Jumat', '09.15 - 10.45', 'Projek IPAS (Sains Terapan)', 'Drs. Suryono, M.Pd.', 'Lab TJKT 1', 0),
  (64, 'Jumat', '11.00 - 11.45', 'Pemeliharaan Lab Jaringan & Refleksi', 'Wali Kelas & Seluruh Siswa', 'Lab TJKT 1', 0)
ON CONFLICT (id) DO UPDATE SET
  day_name = EXCLUDED.day_name,
  time_slot = EXCLUDED.time_slot,
  subject = EXCLUDED.subject,
  teacher = EXCLUDED.teacher,
  room = EXCLUDED.room,
  sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- 18. Pengumuman Resmi Kelas (announcements)
-- ============================================================================
INSERT INTO public.announcements (id, title, date_label, author, tag, content)
VALUES
  (4, 'tes aja ini', '18 Okt 2026', 'Wali Kelas ', 'Penting', 'tes
'),
  (1, 'Jadwal Praktikum Kejuruan di Lab Jaringan & Komputer', '18 Okt 2026', 'Wali Kelas Drs. Suryono', 'Penting', 'Seluruh siswa X TJKT 1 wajib membawa tang krimping dan multimeter pribadi. Praktikum dimulai tepat pukul 07.15 WIB di Lab Jaringan Gedung C.'),
  (2, 'Pengumpulan Laporan Praktikum Jaringan Semester Ganjil', '15 Okt 2026', 'Sekretaris 1 Aisyah Nurul', 'Akademik', 'Laporan praktikum kabel UTP dan topologi jaringan dikumpulkan dalam format PDF via portal kelas atau cetak rapi bersampul oranye.'),
  (3, 'Pengecekan Pembayaran Iuran Kas Kelas Periode Oktober', '10 Okt 2026', 'Bendahara 1 Dewi Lestari', 'Keuangan', 'Terima kasih atas disiplin pembayaran iuran kas kelas. Rekapitulasi transparansi kas NEXUSS dapat dipantau langsung pada tab Uang Kas portal ini.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  date_label = EXCLUDED.date_label,
  author = EXCLUDED.author,
  tag = EXCLUDED.tag,
  content = EXCLUDED.content;

-- ============================================================================
-- 19. Tugas & Proyek Akademik (tasks)
-- ============================================================================
INSERT INTO public.tasks (id, subject, title, deadline, status, teacher, priority)
VALUES
  (5, 'Fisika Lanjut', 'tes', '2026-10-13', 'Belum Selesai', 'Drs. Suryono, M.Pd.', 'Sedang'),
  (2, 'Dasar-dasar TJKT', 'Praktikum Krimping Kabel UTP T568B & Pengujian LAN Tester', '2026-10-24', 'Belum Selesai', 'Drs. Suryono, M.Pd.', 'Tinggi'),
  (3, 'Routing & Switching', 'Konfigurasi Topologi Router MikroTik, Virtual AP & Hotspot', '2026-10-28', 'Belum Selesai', 'Agus Santoso, M.Kom.', 'Sedang'),
  (4, 'Administrasi Server', 'Instalasi & Pengujian Web Server Apache di Linux VirtualBox', '2026-10-22', 'Belum Selesai', 'Rina Wijaya, S.Kom.', 'Tinggi')
ON CONFLICT (id) DO UPDATE SET
  subject = EXCLUDED.subject,
  title = EXCLUDED.title,
  deadline = EXCLUDED.deadline,
  status = EXCLUDED.status,
  teacher = EXCLUDED.teacher,
  priority = EXCLUDED.priority;
