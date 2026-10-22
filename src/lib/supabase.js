// Supabase Client & Config Wrapper - NEXUSS X TJKT 1
// Mengambil kredensial dari environment variable Vite (.env)

export const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL ? import.meta.env.VITE_SUPABASE_URL : '').trim();
export const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY ? import.meta.env.VITE_SUPABASE_ANON_KEY : '').trim();

// Sinkronkan ke objek window.SUPABASE_CONFIG global agar kompatibel dengan seluruh komponen & SupabaseService
if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = window.SUPABASE_CONFIG || {};

  // Prioritaskan nilai dari environment variable Vite (.env) jika tersedia
  if (SUPABASE_URL) {
    window.SUPABASE_CONFIG.url = SUPABASE_URL;
  }
  if (SUPABASE_ANON_KEY) {
    window.SUPABASE_CONFIG.anonKey = SUPABASE_ANON_KEY;
  }

  // Jika window.SupabaseService sudah siap dan kredensial tersedia di env, inisialisasi client
  if (window.SupabaseService && SUPABASE_URL && SUPABASE_ANON_KEY) {
    if (typeof window.SupabaseService.initClient === 'function') {
      window.SupabaseService.initClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }
}

export const getSupabaseClient = () => {
  if (typeof window !== 'undefined' && window.SupabaseService) {
    return window.SupabaseService;
  }
  return null;
};

export const SupabaseService = typeof window !== 'undefined' ? (window.SupabaseService || null) : null;
export default getSupabaseClient;
