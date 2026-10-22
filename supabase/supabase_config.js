/**
 * ==============================================================================
 * KONFIGURASI KREDENSIAL SUPABASE - NEXUSS X TJKT 1 (SMK NEGERI 1 PBG)
 * ==============================================================================
 * Kredensial Supabase sekarang dikelola melalui file .env di root proyek:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 * 
 * File ini tidak lagi menyimpan kredensial secara hardcoded demi standar keamanan.
 * Konfigurasi diinjeksikan secara dinamis melalui modul aplikasi Vite (src/lib/supabase.js)
 * yang membaca import.meta.env dan dapat diatur melalui file .env atau dialog pengaturan.
 * ==============================================================================
 */

window.SUPABASE_CONFIG = window.SUPABASE_CONFIG || {
  url: '',
  anonKey: ''
};
