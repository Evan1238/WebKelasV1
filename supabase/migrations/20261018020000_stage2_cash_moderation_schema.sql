-- ============================================================================
-- MIGRATION: 20261018020000_stage2_cash_moderation_schema.sql
-- NEXUSS X TJKT 1 - Tahap 2: Kas, Komunitas, & Sistem Moderasi Publik
-- ============================================================================

-- 1. Tabel Pengaturan Kas Kelas (cash_settings)
CREATE TABLE IF NOT EXISTS public.cash_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  monthly_dues BIGINT NOT NULL DEFAULT 25000,
  active_period TEXT NOT NULL DEFAULT 'Bulan Oktober 2026',
  financial_status_label TEXT NOT NULL DEFAULT 'Status Keuangan Sehat',
  initial_balance BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.cash_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read cash_settings"
  ON public.cash_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow admin all cash_settings"
  ON public.cash_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon all cash_settings during dev"
  ON public.cash_settings FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Seed initial cash_settings
INSERT INTO public.cash_settings (id, monthly_dues, active_period, financial_status_label, initial_balance)
VALUES ('main', 25000, 'Bulan Oktober 2026', 'Status Keuangan Sehat', 0)
ON CONFLICT (id) DO UPDATE SET
  monthly_dues = EXCLUDED.monthly_dues,
  active_period = EXCLUDED.active_period,
  financial_status_label = EXCLUDED.financial_status_label,
  updated_at = now();

-- 2. Moderasi Kolom pada sticky_notes
ALTER TABLE public.sticky_notes 
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

-- 3. Moderasi Kolom pada guestbook
ALTER TABLE public.guestbook 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

-- Pastikan guestbook memiliki is_approved
ALTER TABLE public.guestbook 
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT TRUE;

-- 4. View / Aliases untuk Kompatibilitas Penamaan Tabel
CREATE OR REPLACE VIEW public.cash_transactions AS
  SELECT * FROM public.finance_transactions;

CREATE OR REPLACE VIEW public.cash_targets AS
  SELECT * FROM public.target_goals;

CREATE OR REPLACE VIEW public.galleries AS
  SELECT * FROM public.memories;

CREATE OR REPLACE VIEW public.meeting_minutes AS
  SELECT * FROM public.class_meetings;

-- 5. RLS Policies Check untuk Moderasi Publik
-- Izinkan publik (anon) menyisipkan pesan baru ke sticky_notes dengan status pending
DROP POLICY IF EXISTS "Allow anon insert pending sticky_notes" ON public.sticky_notes;
CREATE POLICY "Allow anon insert pending sticky_notes"
  ON public.sticky_notes FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert pending guestbook" ON public.guestbook;
CREATE POLICY "Allow anon insert pending guestbook"
  ON public.guestbook FOR INSERT
  TO anon
  WITH CHECK (true);
