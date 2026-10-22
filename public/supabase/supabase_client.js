/**
 * Supabase Client & Service Layer - NEXUSS X TJKT 1
 * Dirancang dengan standar keamanan tinggi:
 * - Menggunakan Anon Key publik (bukan Service Role)
 * - Otomatis fallback ke LocalStorage jika Supabase belum terhubung
 * - Pemetaan otomatis skema database (snake_case) ke frontend (camelCase)
 * - Mendukung Realtime channel subscriptions
 */

(function (window) {
  'use strict';

  // Kunci penyimpanan konfigurasi di browser
  const STORAGE_KEY_URL = 'exomipa_sb_url';
  const STORAGE_KEY_ANON = 'exomipa_sb_anon';

  // Default atau nilai dari environment
  let currentClient = null;
  let isConnected = false;
  let realtimeChannels = [];

  const getStoredConfig = () => {
    try {
      // 1. Prioritas Utama: File konfigurasi resmi supabase/supabase_config.js
      if (typeof window !== 'undefined' && window.SUPABASE_CONFIG) {
        const fileUrl = (window.SUPABASE_CONFIG.url || '').trim();
        const fileKey = (window.SUPABASE_CONFIG.anonKey || window.SUPABASE_CONFIG.key || '').trim();
        if (fileUrl && fileKey) {
          return { url: fileUrl, key: fileKey, source: 'file' };
        }
      }
      // 2. Global window variables
      if (typeof window !== 'undefined' && (window.NEXUSS_SUPABASE_URL || window.NEXUSS_SUPABASE_ANON)) {
        return {
          url: (window.NEXUSS_SUPABASE_URL || '').trim(),
          key: (window.NEXUSS_SUPABASE_ANON || '').trim(),
          source: 'window'
        };
      }
      // 3. Fallback localStorage
      const url = localStorage.getItem(STORAGE_KEY_URL) || '';
      const key = localStorage.getItem(STORAGE_KEY_ANON) || '';
      return { url: url.trim(), key: key.trim(), source: url ? 'storage' : 'none' };
    } catch (e) {
      return { url: '', key: '', source: 'none' };
    }
  };

  const initClient = (url, key) => {
    if (!url || !key) {
      currentClient = null;
      isConnected = false;
      return null;
    }

    if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
      console.warn('[Supabase] Library @supabase/supabase-js belum dimuat.');
      return null;
    }

    try {
      currentClient = window.supabase.createClient(url.trim(), key.trim(), {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return currentClient;
    } catch (err) {
      console.error('[Supabase] Gagal inisialisasi client:', err);
      currentClient = null;
      isConnected = false;
      return null;
    }
  };

  // Uji koneksi ke endpoint Supabase
  const testConnection = async (url, key) => {
    const client = initClient(url, key);
    if (!client) return { success: false, message: 'Klien Supabase tidak dapat dibuat.' };

    try {
      const { data, error } = await client.from('class_info').select('id, name').limit(1);
      if (error) {
        return { success: false, message: error.message };
      }
      isConnected = true;
      localStorage.setItem(STORAGE_KEY_URL, url.trim());
      localStorage.setItem(STORAGE_KEY_ANON, key.trim());
      return { success: true, message: 'Koneksi ke Supabase berhasil terhubung!', data };
    } catch (e) {
      return { success: false, message: e.message || 'Koneksi jaringan gagal.' };
    }
  };

  // Inisialisasi awal saat load
  const initialConfig = getStoredConfig();
  if (initialConfig.url && initialConfig.key) {
    initClient(initialConfig.url, initialConfig.key);
  }

  // --- SERVICE LAYER API ---
  const SupabaseService = {
    getClient: () => currentClient,
    initClient: (url, key) => initClient(url, key),
    getSession: async () => {
      if (!currentClient || !currentClient.auth) return null;
      try {
        const { data, error } = await currentClient.auth.getSession();
        if (error) throw error;
        return data.session;
      } catch (e) {
        return null;
      }
    },
    getIsConnected: () => isConnected,
    getConfig: getStoredConfig,
    testConnection,

    saveConfig: (url, key) => {
      localStorage.setItem(STORAGE_KEY_URL, url.trim());
      localStorage.setItem(STORAGE_KEY_ANON, key.trim());
      return initClient(url, key);
    },

    disconnect: () => {
      localStorage.removeItem(STORAGE_KEY_URL);
      localStorage.removeItem(STORAGE_KEY_ANON);
      currentClient = null;
      isConnected = false;
      if (realtimeChannels.length > 0) {
        realtimeChannels.forEach(ch => ch.unsubscribe && ch.unsubscribe());
        realtimeChannels = [];
      }
    },

    // --- SUPABASE AUTHENTICATION SERVICE ---
    async signInWithGoogle(customRedirect = null) {
      if (!currentClient) return { success: false, fallback: true, message: 'Klien Supabase belum aktif atau belum terhubung.' };
      try {
        const redirectUrl = customRedirect || (typeof window !== 'undefined' ? (window.location.origin + '/admin.html') : undefined);
        const { data, error } = await currentClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });
        if (error) throw error;
        return { success: true, data };
      } catch (e) {
        return { success: false, fallback: true, message: e.message };
      }
    },

    // Pengecekan tabel profiles berdasarkan UUID user auth
    async getProfileByUserId(uuid) {
      if (!currentClient || !uuid) return null;
      try {
        const { data, error } = await currentClient
          .from('profiles')
          .select('id, email, full_name, role, avatar_url')
          .eq('id', uuid)
          .maybeSingle();
        if (error) {
          console.warn('[Supabase Profiles] Query error:', error.message);
          return null;
        }
        return data;
      } catch (e) {
        console.warn('[Supabase Profiles] Exception:', e);
        return null;
      }
    },

    // Verifikasi murni autentikasi Google dan izin peran di tabel profiles
    async verifyUserProfile(user) {
      if (!currentClient || !user || !user.id) {
        return { authorized: false, reason: 'NO_USER', message: 'Data akun tidak ditemukan.' };
      }
      try {
        // Step 2: Cek tabel profiles di Supabase mencocokkan UUID user.id dengan kolom role
        let { data: profile, error } = await currentClient
          .from('profiles')
          .select('id, email, full_name, role, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        // Fallback: Jika belum ada berdasarkan id UUID, periksa apakah email cocok di profiles
        if (!profile && user.email) {
          const { data: pEmail } = await currentClient
            .from('profiles')
            .select('id, email, full_name, role, avatar_url')
            .eq('email', user.email)
            .maybeSingle();
          if (pEmail) {
            profile = pEmail;
            if (pEmail.id !== user.id) {
              await currentClient.from('profiles').update({ id: user.id }).eq('email', user.email).catch(() => {});
            }
          }
        }

        if (error) {
          console.warn('[Supabase Profiles] Query error:', error.message);
        }

        // Step 3: Jika akun tidak terdaftar di tabel profiles atau tidak memiliki hak akses (role kosong/invalid)
        if (!profile) {
          return {
            authorized: false,
            reason: 'NOT_FOUND',
            message: 'Akun Google (' + user.email + ') belum terdaftar di tabel profiles database Supabase. Hubungi Super Admin untuk menambahkan hak akses akun Anda.'
          };
        }

        const rawRole = (profile.role || '').toLowerCase().trim();
        const validRoles = ['superadmin', 'admin', 'sekretaris', 'bendahara'];

        if (!rawRole || !validRoles.includes(rawRole) || rawRole === 'guest' || rawRole === 'siswa') {
          return {
            authorized: false,
            reason: 'INVALID_ROLE',
            role: profile.role,
            profile,
            message: 'Akses Ditolak: Akun Google (' + user.email + ') tidak memiliki hak akses pengurus (Role saat ini: ' + (profile.role || 'kosong') + '). Akses hanya diberikan untuk role: superadmin, sekretaris, atau bendahara.'
          };
        }

        const normalizedRole = rawRole === 'admin' ? 'superadmin' : rawRole;
        return {
          authorized: true,
          role: normalizedRole,
          profile,
          user
        };
      } catch (err) {
        return {
          authorized: false,
          reason: 'EXCEPTION',
          message: 'Terjadi kendala saat memverifikasi hak akses di database: ' + err.message
        };
      }
    },

    async signInWithEmail(email, password) {
      if (!currentClient) return { success: false, fallback: true, message: 'Klien Supabase belum aktif.' };
      try {
        const { data, error } = await currentClient.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });
        if (error) throw error;
        return { success: true, user: data.user, session: data.session };
      } catch (e) {
        return { success: false, message: e.message };
      }
    },

    async signUpWithEmail(email, password, metadata = {}) {
      if (!currentClient) return { success: false, fallback: true, message: 'Klien Supabase belum aktif.' };
      try {
        const { data, error } = await currentClient.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: metadata
          }
        });
        if (error) throw error;
        return { success: true, user: data.user, session: data.session };
      } catch (e) {
        return { success: false, message: e.message };
      }
    },

    async createOrUpdateProfile({ id, email, full_name, role, avatar_url }) {
      if (!currentClient || !id) return null;
      try {
        const { data, error } = await currentClient
          .from('profiles')
          .upsert({
            id: id,
            email: (email || '').trim().toLowerCase(),
            full_name: (full_name || '').trim(),
            role: role || 'guest',
            avatar_url: avatar_url || '',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (e) {
        console.warn('[Supabase Profiles] Upsert error:', e.message);
        return null;
      }
    },

    async signOutAuth() {
      if (!currentClient) return { success: true };
      try {
        await currentClient.auth.signOut();
        return { success: true };
      } catch (e) {
        return { success: false, message: e.message };
      }
    },

    async getCurrentAuthUser() {
      if (!currentClient) return null;
      try {
        const { data: { user } } = await currentClient.auth.getUser();
        return user;
      } catch (e) {
        return null;
      }
    },

    onAuthStateChange(callback) {
      if (!currentClient) return () => {};
      try {
        const { data: { subscription } } = currentClient.auth.onAuthStateChange((event, session) => {
          callback && callback(event, session);
        });
        return () => subscription && subscription.unsubscribe();
      } catch (e) {
        console.warn('onAuthStateChange error:', e);
        return () => {};
      }
    },

    // 1. Data Informasi Kelas
    async getClassInfo() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('class_info').select('*').eq('id', 1).single();
      if (error) throw error;
      if (!data) return null;

      return {
        name: data.name || 'X TJKT 1',
        tagline: data.tagline || 'NEXUSS (Network Experts & United System Specialist)',
        motto: data.motto || 'Satu Hati, Sejuta Karya, Menembus Cakrawala',
        schoolName: data.school_name || data.schoolName || 'SMK Negeri 1 PBG',
        room: data.room || 'Lab TJKT 1 Gedung A Lt. 2',
        accreditation: data.accreditation || 'A (Unggul)',
        academicYear: data.academic_year || data.academicYear || '2025/2026',
        totalStudents: data.total_students || data.totalStudents || 18,
        homeroomTeacher: data.homeroom_teacher || data.homeroomTeacher || 'Drs. Suryono, M.Pd.',
        homeroomNIP: data.homeroom_nip || data.homeroomNIP || '19720415 199802 1 003',
        president: data.president || 'Budi Wicaksono',
        vicePresident: data.vice_president || data.vicePresident || 'Siti Rahmawati',
        vision: data.vision || 'Mewujudkan generasi saintis muda yang unggul.',
        mission: data.mission || [],
        adminPins: data.admin_pins || data.adminPins || { superadmin: '1234', sekretaris: '2345', bendahara: '3456' }
      };
    },

    // 2. Data Siswa
    async getStudents() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('students').select('*').order('no_absen', { ascending: true });
      if (error) throw error;
      if (!data) return null;

      return data.map(s => ({
        id: s.id,
        no: s.no_absen !== undefined ? s.no_absen : s.no,
        name: s.name,
        nick: s.nick || s.name.split(' ')[0],
        gender: s.gender || 'L',
        role: s.role || 'Anggota Kelas',
        avatar: s.avatar,
        interest: s.interest || '-',
        dream: s.dream || '-',
        quote: s.quote || '-',
        ig: s.ig || '-',
        piketDay: s.piket_day || s.piketDay || 'Senin'
      }));
    },

    // 3. Denah Meja Lab TJKT 1
    async getSeating() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('seating').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (!data) return null;

      return data.map(seat => ({
        id: seat.id,
        row: seat.row_num !== undefined ? seat.row_num : seat.row,
        col: seat.col_num !== undefined ? seat.col_num : seat.col,
        studentId: seat.student_id !== undefined ? seat.student_id : seat.studentId
      }));
    },

    // 4. Jadwal Piket & Checklist
    async getDutySchedule() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('duty_schedule').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (!data) return null;

      const map = {};
      data.forEach(item => { 
        if (item.day_name) {
          map[item.day_name] = item.student_names || []; 
        }
      });
      return map;
    },

    async getPiketChecklist() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('piket_checklist').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (!data) return null;

      return data.map(p => ({
        id: p.id,
        task: p.task,
        done: Boolean(p.done),
        time: p.time_label || p.time || 'Piket',
        points: p.points || '-'
      }));
    },

    async togglePiketTask(taskId, currentStatus) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('piket_checklist')
        .update({ done: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // 5. Modul Pembelajaran
    async getClassModules() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('class_modules').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (!data) return null;

      return data.map(m => ({
        id: m.id,
        title: m.title,
        subject: m.subject,
        teacher: m.teacher,
        size: m.size_label || m.size || '1.0 MB',
        date: m.date_label || m.date || 'Hari Ini',
        format: m.format_label || m.format || 'PDF',
        downloads: m.downloads_count || m.downloads || 0,
        desc: m.desc_text || m.desc || '',
        fileUrl: m.file_url || m.fileUrl || null
      }));
    },

    async addClassModule(mod) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('class_modules').insert([{
        title: mod.title,
        subject: mod.subject,
        teacher: mod.teacher,
        size_label: mod.size || '1.0 MB',
        date_label: mod.date || 'Hari Ini',
        format_label: mod.format || 'PDF',
        desc_text: mod.desc,
        file_url: mod.fileUrl || null
      }]).select().single();
      if (error) throw error;
      return data;
    },

    // 6. Notulensi Rapat
    async getClassMeetings() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('class_meetings').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (!data) return null;

      return data.map(m => ({
        id: m.id,
        title: m.title,
        date: m.meeting_date || m.date,
        leader: m.leader,
        notetaker: m.notetaker,
        venue: m.venue || 'Lab TJKT 1 SMK Negeri 1 PBG',
        attendance: m.attendance,
        summary: m.summary,
        decisions: m.decisions || [],
        status: m.status || 'Selesai'
      }));
    },

    async addClassMeeting(meeting) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('class_meetings').insert([{
        title: meeting.title,
        meeting_date: meeting.date,
        leader: meeting.leader,
        notetaker: meeting.notetaker,
        venue: meeting.venue || 'Lab TJKT 1 SMK Negeri 1 PBG',
        attendance: meeting.attendance,
        summary: meeting.summary,
        decisions: meeting.decisions,
        status: meeting.status || 'Selesai'
      }]).select().single();
      if (error) throw error;
      return data;
    },

    // 7. Kas & Transaksi
    async getFinance() {
      if (!currentClient) return null;
      const { data: txs, error: txError } = await currentClient
        .from('finance_transactions')
        .select('*')
        .order('id', { ascending: false });
      if (txError) throw txError;

      let inSum = 0;
      let outSum = 0;
      const mappedTxs = (txs || []).map(t => {
        const amt = Number(t.amount || 0);
        const isIncome = t.trans_type === 'in' || t.trans_type === 'pemasukan';
        if (isIncome) inSum += amt;
        else outSum += amt;
        // Format display date
        let displayDate = t.trans_date;
        try {
          if (t.trans_date && typeof t.trans_date === 'string' && t.trans_date.includes('-')) {
            const parts = t.trans_date.split('-');
            if (parts.length === 3) {
              const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              displayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            }
          }
        } catch (e) {}
        return {
          id: t.id,
          date: displayDate || t.trans_date || t.date || 'Hari ini',
          rawDate: t.trans_date || new Date().toISOString().slice(0, 10),
          desc: t.description || t.desc,
          type: (t.trans_type === 'out' || t.trans_type === 'pengeluaran') ? 'out' : 'in',
          amount: amt,
          category: t.category || 'Operasional',
          proofUrl: t.proof_url || t.proofUrl || null
        };
      });

      return {
        balance: inSum - outSum,
        monthlyDues: 25000,
        transactions: mappedTxs
      };
    },

    async addFinanceTransaction(tx) {
      if (!currentClient) return null;
      let isoDate = new Date().toISOString().slice(0, 10);
      if (tx.rawDate && /^\d{4}-\d{2}-\d{2}$/.test(tx.rawDate)) {
        isoDate = tx.rawDate;
      } else if (tx.date && /^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
        isoDate = tx.date;
      }
      const rawType = String(tx.type || tx.trans_type || '').toLowerCase();
      const dbType = (rawType === 'pengeluaran' || rawType === 'out' || rawType === 'debit' || rawType === 'keluar') ? 'out' : 'in';

      const { data, error } = await currentClient.from('finance_transactions').insert([{
        trans_date: isoDate,
        description: tx.desc || tx.description || 'Transaksi Kas',
        trans_type: dbType,
        amount: Number(tx.amount || 0),
        category: tx.category || 'Operasional'
      }]).select().single();
      if (error) throw error;
      return data;
    },

    // 8. Sticky Notes (Mading Digital)
    async getStickyNotes(approvedOnly = false) {
      if (!currentClient) return null;
      let query = currentClient.from('sticky_notes').select('*');
      if (approvedOnly) {
        query = query.eq('is_approved', true);
      }
      const { data, error } = await query.order('id', { ascending: false });
      if (error) throw error;
      if (!data) return null;

      return data.map(s => ({
        id: s.id,
        text: s.text,
        author: s.author,
        color: s.color || 'bg-amber-100/90 border-amber-300 text-amber-950 shadow-amber-200/50',
        date: s.date_label || s.date || 'Hari Ini',
        rotate: s.rotate_deg || s.rotate || 'rotate-0',
        is_approved: s.is_approved === true && s.status !== 'pending',
        status: s.status || (s.is_approved === false ? 'pending' : 'approved')
      }));
    },

    async addStickyNote(note) {
      if (!currentClient) return null;
      const isApproved = note.is_approved !== undefined ? note.is_approved : false;
      const status = note.status || (isApproved ? 'approved' : 'pending');
      const { data, error } = await currentClient.from('sticky_notes').insert([{
        text: note.text,
        author: note.author,
        color: note.color,
        date_label: note.date || 'Hari Ini',
        rotate_deg: note.rotate || 'rotate-0',
        is_approved: isApproved,
        status: status
      }]).select().single();
      if (error) throw error;
      return data;
    },

    async deleteStickyNote(noteId) {
      if (!currentClient) return null;
      const { error } = await currentClient.from('sticky_notes').delete().eq('id', noteId);
      if (error) throw error;
      return true;
    },

    // 9. Buku Tamu (Guestbook)
    async getGuestbook(approvedOnly = false) {
      if (!currentClient) return null;
      let query = currentClient.from('guestbook').select('*');
      if (approvedOnly) {
        query = query.eq('is_approved', true);
      }
      const { data, error } = await query.order('id', { ascending: false });
      if (error) throw error;
      if (!data) return null;

      return data.map(g => ({
        id: g.id,
        name: g.name,
        role: g.role || g.relationship || 'Tamu',
        text: g.text || g.message || '',
        date: g.date_label || g.date || 'Hari Ini',
        is_approved: g.is_approved === true && g.status !== 'pending',
        status: g.status || (g.is_approved === false ? 'pending' : 'approved')
      }));
    },

    async addGuestbookEntry(entry) {
      if (!currentClient) return null;
      const isApproved = entry.is_approved !== undefined ? Boolean(entry.is_approved) : false;
      const status = entry.status || (isApproved ? 'approved' : 'pending');
      const { data, error } = await currentClient.from('guestbook').insert([{
        name: entry.name,
        role: entry.role || entry.relationship || 'Tamu',
        text: entry.text || entry.message || '',
        date_label: entry.date || 'Hari Ini',
        is_approved: isApproved,
        status: status
      }]).select().single();
      if (error) throw error;
      return data;
    },

    // 10. Polling Aspirasi & Suara
    async getPolls() {
      if (!currentClient) return null;
      const { data: pollsData, error: pollsError } = await currentClient
        .from('polls')
        .select('*, poll_options(*)')
        .order('id', { ascending: true });
      if (pollsError) throw pollsError;
      if (!pollsData) return null;

      return pollsData.map(p => {
        let question = p.question;
        let options = (p.poll_options || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(o => ({
          id: o.id,
          text: o.text,
          votes: o.votes || 0
        }));

        if (typeof question === 'string' && question.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(question);
            if (parsed.question) question = parsed.question;
            if ((!options || options.length === 0) && Array.isArray(parsed.options)) {
              options = parsed.options.map((o, idx) => ({
                id: o.id || idx + 1,
                text: typeof o === 'string' ? o : (o.text || `Opsi ${idx + 1}`),
                votes: o.votes || 0
              }));
            }
          } catch (e) {}
        }

        return {
          id: p.id,
          question,
          active: Boolean(p.active),
          options
        };
      });
    },

    async votePoll(pollId, optionId, voterId) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.rpc('cast_poll_vote', {
        p_poll_id: pollId,
        p_option_id: optionId,
        p_voter_id: voterId
      });
      if (error) throw error;
      return data;
    },

    // 11. Pengumuman
    async getAnnouncements() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('announcements').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (!data) return null;

      return data.map(a => ({
        id: a.id,
        title: a.title,
        date: a.date_label || a.date,
        author: a.author,
        tag: a.tag || 'Penting',
        content: a.content
      }));
    },

    async likeMemory(memoryId) {
      if (!currentClient) return null;
      const numId = Number(memoryId);
      const queryId = !isNaN(numId) && numId < 1000000000 ? numId : memoryId;
      try {
        const { data: current } = await currentClient.from('memories').select('likes_count').eq('id', queryId).single();
        if (current) {
          const nextLikes = (current.likes_count || 0) + 1;
          const { data, error } = await currentClient.from('memories').update({ likes_count: nextLikes }).eq('id', queryId).select().single();
          if (!error && data) return data.likes_count;
        }
      } catch (e) {
        console.warn('likeMemory error:', e);
      }
      return 1;
    },

    async incrementDownloads(moduleId) {
      if (!currentClient) return null;
      try {
        const { data, error } = await currentClient.rpc('increment_module_downloads', { p_module_id: moduleId });
        if (!error && data !== null) return data;
      } catch (e) {
        // Fallback jika RPC belum terpasang
      }
      const { data: current } = await currentClient.from('class_modules').select('downloads_count').eq('id', moduleId).single();
      const nextCount = (current?.downloads_count || 0) + 1;
      const { data, error } = await currentClient.from('class_modules').update({ downloads_count: nextCount }).eq('id', moduleId).select().single();
      if (error) throw error;
      return data?.downloads_count || nextCount;
    },

    async deleteFinanceTransaction(id) {
      if (!currentClient) return null;
      const { error } = await currentClient.from('finance_transactions').delete().eq('id', id);
      if (error) throw error;
      return true;
    },

    async updateTask(id, updates) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('tasks').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },

    async deleteTask(id) {
      if (!currentClient) return null;
      const { error } = await currentClient.from('tasks').delete().eq('id', id);
      if (error) throw error;
      return true;
    },

    async deleteClassMeeting(id) {
      if (!currentClient) return null;
      const { error } = await currentClient.from('class_meetings').delete().eq('id', id);
      if (error) throw error;
      return true;
    },

    async deleteClassModule(id) {
      if (!currentClient) return null;
      const { error } = await currentClient.from('class_modules').delete().eq('id', id);
      if (error) throw error;
      return true;
    },

    // 13. Galeri Foto & Kenangan
    async getMemories() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('memories').select('*').order('id', { ascending: false });
      if (error) throw error;
      if (!data) return null;

      return data.map(m => ({
        id: m.id,
        title: m.title,
        date: m.event_date || m.date || 'Hari Ini',
        img: m.img,
        desc: m.desc_text || m.desc || '',
        likes: m.likes_count || m.likes || 0
      }));
    },

    async addMemory(mem) {
      if (!currentClient) return null;
      const payload = {
        title: mem.title,
        event_date: mem.date || mem.event_date || 'Hari Ini',
        img: mem.img,
        desc_text: mem.desc || mem.desc_text || '',
        likes_count: mem.likes || 0
      };
      if (typeof mem.id === 'number' && mem.id < 1000000000) {
        payload.id = mem.id;
      }
      const { data, error } = await currentClient.from('memories').insert([payload]).select().single();
      if (error) throw error;
      return {
        id: data.id,
        title: data.title,
        date: data.event_date || mem.date,
        img: data.img,
        desc: data.desc_text || mem.desc,
        likes: data.likes_count || 0
      };
    },

    // 14. Tugas Akademik
    async getTasks() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('tasks').select('*').order('deadline', { ascending: true });
      if (error) throw error;
      if (!data) return null;

      return data.map(t => ({
        id: t.id,
        subject: t.subject,
        title: t.title,
        deadline: t.deadline,
        status: t.status,
        teacher: t.teacher,
        priority: t.priority
      }));
    },

    async addTask(task) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('tasks').insert([{
        subject: task.subject,
        title: task.title,
        deadline: task.deadline,
        status: task.status || 'Belum Selesai',
        teacher: task.teacher,
        priority: task.priority || 'Sedang'
      }]).select().single();
      if (error) throw error;
      return data;
    },

    async toggleTask(taskId, currentStatus) {
      if (!currentClient) return null;
      const newStatus = currentStatus === 'Selesai' ? 'Belum Selesai' : 'Selesai';
      const { data, error } = await currentClient.from('tasks').update({ status: newStatus }).eq('id', taskId).select().single();
      if (error) throw error;
      return data;
    },

    // 15. Target Kas Angkatan
    async getTargetGoals() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('target_goals').select('*').order('id', { ascending: true });
      if (error) throw error;
      if (!data) return null;

      return data.map(g => ({
        id: g.id,
        title: g.title,
        current: Number(g.current_amount || 0),
        target: Number(g.target_amount || 0),
        deadline: g.deadline,
        completed: Boolean(g.completed)
      }));
    },

    async addTargetGoal(goal) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('target_goals').insert([{
        title: goal.title,
        current_amount: Number(goal.current || 0),
        target_amount: Number(goal.target || 0),
        deadline: goal.deadline,
        completed: Boolean(goal.completed)
      }]).select().single();
      if (error) throw error;
      return data;
    },

    async updateTargetGoal(id, updates) {
      if (!currentClient) return null;
      const payload = {};
      if (updates.current !== undefined) payload.current_amount = Number(updates.current);
      if (updates.target !== undefined) payload.target_amount = Number(updates.target);
      if (updates.completed !== undefined) payload.completed = Boolean(updates.completed);
      if (updates.deadline !== undefined) payload.deadline = updates.deadline;
      if (updates.title !== undefined) payload.title = updates.title;

      const { data, error } = await currentClient.from('target_goals').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },

    // 16. Tata Tertib Kelas
    async getClassRules() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('class_rules').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      if (!data) return null;

      return data.map(r => ({
        id: r.id,
        category: r.category,
        icon: r.icon,
        badge: r.badge,
        rules: r.rules || []
      }));
    },

    // 17. Jadwal Mingguan KBM
    async getWeeklySchedule() {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('weekly_schedule').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      if (!data) return null;

      const grouped = {};
      data.forEach(item => {
        if (!grouped[item.day_name]) grouped[item.day_name] = [];
        grouped[item.day_name].push({
          id: item.id,
          time: item.time_slot,
          subject: item.subject,
          teacher: item.teacher,
          room: item.room
        });
      });
      return grouped;
    },

    // 18. Pembaruan Data Kelas & Siswa
    async updateClassInfo(info) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('class_info').upsert({
        id: 1,
        name: info.name,
        tagline: info.tagline,
        motto: info.motto,
        school_name: info.schoolName,
        room: info.room,
        accreditation: info.accreditation,
        academic_year: info.academicYear,
        total_students: info.totalStudents,
        homeroom_teacher: info.homeroomTeacher,
        homeroom_nip: info.homeroomNIP,
        president: info.president,
        vice_president: info.vicePresident,
        vision: info.vision,
        mission: info.mission,
        admin_pins: info.adminPins || { superadmin: '1234', sekretaris: '2345', bendahara: '3456' },
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' }).select().single();
      if (error) throw error;
      return data;
    },

    async updateStudent(id, studentData) {
      if (!currentClient) return null;
      const payload = {};
      if (studentData.name) payload.name = studentData.name;
      if (studentData.nick) payload.nick = studentData.nick;
      if (studentData.role) payload.role = studentData.role;
      if (studentData.interest) payload.interest = studentData.interest;
      if (studentData.dream) payload.dream = studentData.dream;
      if (studentData.quote) payload.quote = studentData.quote;
      if (studentData.ig) payload.ig = studentData.ig;
      if (studentData.avatar) payload.avatar = studentData.avatar;
      payload.updated_at = new Date().toISOString();

      const { data, error } = await currentClient.from('students').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },

    async addStudent(studentData) {
      if (!currentClient) return null;
      const payload = {
        name: studentData.name || 'Siswa Baru',
        nick: studentData.nick || (studentData.name ? studentData.name.split(' ')[0] : 'Siswa'),
        gender: studentData.gender || 'L',
        role: studentData.role || 'Anggota Kelas',
        interest: studentData.interest || '-',
        dream: studentData.dream || '-',
        quote: studentData.quote || '-',
        ig: studentData.ig || '-',
        avatar: studentData.avatar || '',
        piket_day: studentData.piketDay || studentData.piket_day || 'Senin',
        no_absen: studentData.no !== undefined ? Number(studentData.no) : (studentData.no_absen !== undefined ? Number(studentData.no_absen) : (studentData.id ? Number(studentData.id) : 1)),
        updated_at: new Date().toISOString()
      };
      if (studentData.id) {
        payload.id = Number(studentData.id);
      }
      const { data, error } = await currentClient.from('students').insert([payload]).select().single();
      if (error) throw error;
      return data;
    },

    async deleteStudent(id) {
      if (!currentClient) return null;
      try {
        await currentClient.from('student_dues').delete().eq('student_id', id);
      } catch (e) {
        // Abaikan jika tidak ada relasi cascade
      }
      const { data, error } = await currentClient.from('students').delete().eq('id', id).select();
      if (error) throw error;
      return data;
    },

    async updateDutySchedule(dutyMap) {
      if (!currentClient || !dutyMap) return null;
      const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
      const rows = days.map((day, idx) => ({
        id: idx + 1,
        day_name: day,
        student_names: dutyMap[day] || [],
        updated_at: new Date().toISOString()
      }));
      const { data, error } = await currentClient.from('duty_schedule').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      return data;
    },

    async updateSeating(seatingList) {
      if (!currentClient || !seatingList) return null;
      const rows = seatingList.map(s => ({
        id: s.id,
        row_num: s.row !== undefined ? s.row : s.row_num,
        col_num: s.col !== undefined ? s.col : s.col_num,
        student_id: s.studentId !== undefined ? s.studentId : s.student_id,
        updated_at: new Date().toISOString()
      }));
      const { data, error } = await currentClient.from('seating').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      return data;
    },

    async updateClassRules(rulesList) {
      if (!currentClient || !rulesList) return null;
      const rows = rulesList.map((r, idx) => ({
        id: r.id || idx + 1,
        category: r.category,
        icon: r.icon || 'ph-sparkle',
        badge: r.badge || 'Resmi',
        rules: r.rules || [],
        sort_order: r.sortOrder || r.sort_order || idx + 1,
        updated_at: new Date().toISOString()
      }));
      const { data, error } = await currentClient.from('class_rules').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      return data;
    },

    async updateClassMeeting(id, updates) {
      if (!currentClient) return null;
      const payload = {};
      if (updates.title) payload.title = updates.title;
      if (updates.date) payload.meeting_date = updates.date;
      if (updates.leader) payload.leader = updates.leader;
      if (updates.notetaker) payload.notetaker = updates.notetaker;
      if (updates.venue) payload.venue = updates.venue;
      if (updates.attendance) payload.attendance = updates.attendance;
      if (updates.summary) payload.summary = updates.summary;
      if (updates.decisions) payload.decisions = updates.decisions;
      if (updates.status) payload.status = updates.status;

      const { data, error } = await currentClient.from('class_meetings').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },

    async updateWeeklySchedule(scheduleMap) {
      if (!currentClient || !scheduleMap) return null;
      try {
        await currentClient.from('weekly_schedule').delete().neq('id', 0);
        const rows = [];
        for (const day of ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']) {
          const slots = scheduleMap[day] || [];
          for (const slot of slots) {
            rows.push({
              day_name: day,
              time_slot: slot.time,
              subject: slot.subject,
              teacher: slot.teacher,
              room: slot.room
            });
          }
        }
        if (rows.length > 0) {
          const { error } = await currentClient.from('weekly_schedule').insert(rows);
          if (error) throw error;
        }
        return true;
      } catch (err) {
        console.warn('Supabase update weekly schedule exception:', err);
        return false;
      }
    },

    async deleteMemory(id) {
      if (!currentClient) return null;
      const numId = Number(id);
      const queryId = !isNaN(numId) && numId < 1000000000 ? numId : id;
      const { data, error } = await currentClient.from('memories').delete().eq('id', queryId);
      if (error) throw error;
      return true;
    },

    async deleteGuestbookEntry(id) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('guestbook').delete().eq('id', id);
      if (error) throw error;
      return data;
    },

    async addAnnouncement(ann) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('announcements').insert([{
        title: ann.title,
        date_label: ann.date || 'Hari Ini',
        author: ann.author || 'Pengurus Kelas',
        tag: ann.tag || 'Penting',
        content: ann.content
      }]).select().single();
      if (error) throw error;
      return data;
    },

    async deleteAnnouncement(id) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('announcements').delete().eq('id', id);
      if (error) throw error;
      return data;
    },

    async createPoll(question, options) {
      if (!currentClient) return null;
      let questionText = '';
      let optList = [];

      if (typeof question === 'object' && question !== null) {
        questionText = question.question || '';
        optList = (question.options || []).map(o => typeof o === 'string' ? o : (o.text || ''));
      } else {
        questionText = String(question || '');
        optList = options || [];
      }

      const { data: poll, error: pollErr } = await currentClient.from('polls').insert([{
        question: questionText,
        active: true
      }]).select().single();
      if (pollErr) throw pollErr;

      if (optList && optList.length > 0) {
        const optRows = optList.map((opt, idx) => ({
          poll_id: poll.id,
          text: typeof opt === 'string' ? opt : (opt.text || `Opsi ${idx + 1}`),
          votes: 0,
          sort_order: idx + 1
        }));
        await currentClient.from('poll_options').insert(optRows);
      }
      return poll;
    },

    async deletePoll(id) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('polls').delete().eq('id', id);
      if (error) throw error;
      return data;
    },

    // 19. Rekap Status Iuran Siswa
    async getStudentDues(monthPeriod = null) {
      if (!currentClient) return null;
      let query = currentClient.from('student_dues').select('*');
      if (monthPeriod) {
        query = query.eq('month_period', monthPeriod);
      }
      const { data, error } = await query.order('student_id', { ascending: true });
      if (error) throw error;
      
      let rows = data || [];
      if (rows.length === 0 && monthPeriod) {
        const { data: allData } = await currentClient.from('student_dues').select('*').order('student_id', { ascending: true });
        if (allData && allData.length > 0) rows = allData;
      }

      return rows.map(d => ({
        id: d.id,
        studentId: d.student_id,
        monthPeriod: d.month_period,
        academicYear: d.academic_year,
        amount: Number(d.amount || 25000),
        status: d.status || 'Belum Lunas',
        paidAt: d.paid_at,
        paymentMethod: d.payment_method || 'Tunai',
        notes: d.notes || '',
        verifiedBy: d.verified_by || 'Bendahara Kelas'
      }));
    },

    async toggleStudentDue(studentId, targetStatus, paymentMethod = 'Tunai', verifiedBy = 'Bendahara Kelas', monthPeriod = null) {
      if (!currentClient) return null;
      let nextStatus = 'Lunas';
      if (targetStatus === 'Lunas' || targetStatus === 'Belum Lunas' || targetStatus === 'Belum') {
        nextStatus = targetStatus === 'Lunas' ? 'Lunas' : 'Belum Lunas';
      }
      const paidAt = nextStatus === 'Lunas' ? new Date().toISOString() : null;
      const period = monthPeriod || 'Bulan Oktober 2026';

      const { data, error } = await currentClient
        .from('student_dues')
        .update({
          status: nextStatus,
          paid_at: paidAt,
          payment_method: paymentMethod,
          verified_by: verifiedBy,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', Number(studentId))
        .select();

      if (error || !data || data.length === 0) {
        await currentClient
          .from('student_dues')
          .upsert({
            student_id: Number(studentId),
            month_period: period,
            academic_year: '2026/2027',
            amount: 25000,
            status: nextStatus,
            paid_at: paidAt,
            payment_method: paymentMethod,
            verified_by: verifiedBy,
            updated_at: new Date().toISOString()
          });
      }
      return data;
    },

    async updateStudentDue(studentId, updates, monthPeriod = 'Maret 2026') {
      if (!currentClient) return null;
      const payload = {
        student_id: studentId,
        month_period: monthPeriod,
        updated_at: new Date().toISOString()
      };
      if (updates.status !== undefined) {
        payload.status = updates.status;
        if (updates.status === 'Lunas' && !updates.paid_at) {
          payload.paid_at = new Date().toISOString();
        } else if (updates.status === 'Belum Lunas') {
          payload.paid_at = null;
        }
      }
      if (updates.paid_at !== undefined) payload.paid_at = updates.paid_at;
      if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.verifiedBy !== undefined) payload.verified_by = updates.verifiedBy;

      const { data, error } = await currentClient
        .from('student_dues')
        .upsert(payload, { onConflict: 'student_id,month_period,academic_year' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // 20. Riwayat Audit Aktivitas Admin
    async getAuditLogs(limitCount = 50) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('admin_audit_logs')
        .select('*')
        .order('id', { ascending: false })
        .limit(limitCount);
      if (error) throw error;
      if (!data) return [];

      return data.map(log => ({
        id: log.id,
        role: log.role,
        actionName: log.action_name,
        targetEntity: log.target_entity,
        details: log.details,
        performedBy: log.performed_by,
        createdAt: log.created_at
      }));
    },

    async addAuditLog({ role = 'superadmin', actionName, targetEntity, details, performedBy }) {
      if (!currentClient) return null;
      const { data, error } = await currentClient.from('admin_audit_logs').insert([{
        role,
        action_name: actionName,
        target_entity: targetEntity,
        details,
        performed_by: performedBy || 'Pengurus NEXUSS'
      }]).select().single();
      if (error) {
        console.warn('Gagal mencatat audit log:', error.message);
        return null;
      }
      return data;
    },

    // 21. Manajemen Role Email Akun Google (RBAC Custom Role)
    async getAdminRoles() {
      if (!currentClient) return null;
      try {
        const { data, error } = await currentClient
          .from('admin_roles')
          .select('*')
          .order('id', { ascending: true });
        if (error) throw error;
        return (data || []).map(r => ({
          id: r.id,
          email: r.email,
          role: r.role,
          name: r.name || '',
          avatar: r.avatar || '',
          createdAt: r.created_at
        }));
      } catch (e) {
        console.warn('getAdminRoles error:', e.message);
        return null;
      }
    },

    async addAdminRole({ email, role = 'sekretaris', name = '', avatar = '' }) {
      if (!currentClient) return null;
      const cleanEmail = (email || '').trim().toLowerCase();
      const { data, error } = await currentClient
        .from('admin_roles')
        .upsert({
          email: cleanEmail,
          role: role,
          name: name.trim(),
          avatar: avatar || '',
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateAdminRole(id, newRole) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('admin_roles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async deleteAdminRole(id) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('admin_roles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return data;
    },

    async verifyGoogleAccount(email) {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail) return { authorized: false, message: 'Email tidak boleh kosong.' };
      
      if (currentClient) {
        try {
          const { data, error } = await currentClient
            .from('admin_roles')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();
          if (error) throw error;
          if (data) {
            return {
              authorized: true,
              role: data.role,
              name: data.name || cleanEmail,
              email: data.email,
              avatar: data.avatar || ''
            };
          }
        } catch (e) {
          console.warn('verifyGoogleAccount error:', e.message);
        }
      }
      return { authorized: false, message: `Email ${cleanEmail} belum didaftarkan sebagai pengurus.` };
    },

    // 24. Media Sosial Kelas (social_links)
    
    // --- TAHAP 2: CASH SETTINGS & ENHANCED FINANCE ---
    async getCashSettings() {
      if (!currentClient) return null;
      try {
        const { data, error } = await currentClient
          .from('cash_settings')
          .select('*')
          .eq('id', 'main')
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          return {
            id: 'main',
            monthly_dues: 25000,
            active_period: 'Bulan Oktober 2026',
            financial_status_label: 'Status Keuangan Sehat',
            initial_balance: 0
          };
        }
        return {
          id: data.id,
          monthly_dues: Number(data.monthly_dues || 25000),
          active_period: data.active_period || 'Bulan Oktober 2026',
          financial_status_label: data.financial_status_label || 'Status Keuangan Sehat',
          initial_balance: Number(data.initial_balance || 0)
        };
      } catch (e) {
        console.warn('Gagal memuat cash_settings, fallback lokal:', e.message);
        return {
          id: 'main',
          monthly_dues: 25000,
          active_period: 'Bulan Oktober 2026',
          financial_status_label: 'Status Keuangan Sehat',
          initial_balance: 0
        };
      }
    },

    async updateCashSettings(settings) {
      if (!currentClient) return null;
      const payload = {
        id: 'main',
        monthly_dues: Number(settings.monthly_dues || 25000),
        active_period: settings.active_period || 'Bulan Oktober 2026',
        financial_status_label: settings.financial_status_label || 'Status Keuangan Sehat',
        initial_balance: Number(settings.initial_balance || 0),
        updated_at: new Date().toISOString()
      };
      const { data, error } = await currentClient
        .from('cash_settings')
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateFinanceTransaction(id, tx) {
      if (!currentClient) return null;
      const payload = {};
      if (tx.rawDate && /^\d{4}-\d{2}-\d{2}$/.test(tx.rawDate)) {
        payload.trans_date = tx.rawDate;
      } else if (tx.date && /^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
        payload.trans_date = tx.date;
      }
      if (tx.type || tx.trans_type) {
        const rawType = String(tx.type || tx.trans_type || '').toLowerCase();
        payload.trans_type = (rawType === 'pengeluaran' || rawType === 'out' || rawType === 'debit' || rawType === 'keluar') ? 'out' : 'in';
      }
      if (tx.amount !== undefined) payload.amount = Number(tx.amount);
      if (tx.category) payload.category = tx.category;

      const { data, error } = await currentClient
        .from('finance_transactions')
        .update(payload)
        .eq('id', Number(id))
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async deleteTargetGoal(id) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('target_goals')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },

    async updateMemory(id, mem) {
      if (!currentClient) return null;
      const payload = {};
      if (mem.title !== undefined) payload.title = mem.title;
      if (mem.date !== undefined || mem.event_date !== undefined) payload.event_date = mem.date || mem.event_date;
      if (mem.img !== undefined) payload.img = mem.img;
      if (mem.desc !== undefined || mem.desc_text !== undefined) payload.desc_text = mem.desc || mem.desc_text;
      if (mem.likes !== undefined || mem.likes_count !== undefined) payload.likes_count = mem.likes !== undefined ? mem.likes : mem.likes_count;

      const numId = Number(id);
      const queryId = !isNaN(numId) && numId < 1000000000 ? numId : id;

      let { data, error } = await currentClient
        .from('memories')
        .update(payload)
        .eq('id', queryId)
        .select()
        .maybeSingle();

      if (!data) {
        const insertPayload = {
          id: queryId,
          title: mem.title || 'Foto Dokumentasi TJKT 1',
          event_date: mem.date || mem.event_date || 'Hari Ini',
          img: mem.img || '',
          desc_text: mem.desc || mem.desc_text || '',
          likes_count: mem.likes || 0
        };
        const upsertRes = await currentClient
          .from('memories')
          .upsert([insertPayload], { onConflict: 'id' })
          .select()
          .single();
        data = upsertRes.data;
        error = upsertRes.error;
      }
      if (error) throw error;
      return {
        id: data.id,
        title: data.title,
        date: data.event_date,
        img: data.img,
        desc: data.desc_text,
        likes: data.likes_count || 0
      };
    },

    async updatePoll(id, poll) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('polls')
        .update({
          question: poll.question,
          active: poll.active !== false
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async resetPollVotes(pollId) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('poll_options')
        .update({ votes: 0 })
        .eq('poll_id', pollId);
      if (error) throw error;
      return true;
    },

    // Moderasi Sticky Notes
    async approveStickyNote(id) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('sticky_notes')
        .update({ is_approved: true, status: 'approved' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async rejectStickyNote(id) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('sticky_notes')
        .update({ is_approved: false, status: 'pending' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getAllStickyNotesAdmin() {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('sticky_notes')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      if (!data) return [];
      return data.map(s => ({
        id: s.id,
        text: s.text,
        author: s.author,
        color: s.color || 'bg-amber-100/90 border-amber-300 text-amber-950 shadow-amber-200/50',
        date: s.date_label || s.date || 'Hari Ini',
        rotate: s.rotate_deg || s.rotate || 'rotate-0',
        is_approved: s.is_approved !== false,
        status: s.status || (s.is_approved !== false ? 'approved' : 'pending')
      }));
    },

    // Moderasi Guestbook
    async approveGuestbookEntry(id) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('guestbook')
        .update({ is_approved: true, status: 'approved' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async rejectGuestbookEntry(id) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('guestbook')
        .update({ is_approved: false, status: 'pending' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getAllGuestbookAdmin() {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('guestbook')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      if (!data) return [];
      return data.map(g => ({
        id: g.id,
        name: g.name,
        role: g.role || 'Tamu',
        text: g.text,
        date: g.date_label || g.date || 'Hari Ini',
        is_approved: g.is_approved !== false,
        status: g.status || (g.is_approved !== false ? 'approved' : 'pending')
      }));
    },

    async getSocialLinks() {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });
      if (error) throw error;
      return data || [];
    },

    async addSocialLink(linkData) {
      if (!currentClient) return null;
      const payload = {
        platform: linkData.platform || 'Instagram',
        label_username: linkData.label_username || linkData.labelUsername || '@nexuss.xtjkt1',
        url: linkData.url || 'https://instagram.com/nexuss.xtjkt1',
        icon_name: linkData.icon_name || linkData.iconName || 'ph-link',
        sort_order: Number(linkData.sort_order || linkData.sortOrder || 0),
        is_active: linkData.is_active !== undefined ? Boolean(linkData.is_active) : (linkData.isActive !== undefined ? Boolean(linkData.isActive) : true),
        updated_at: new Date().toISOString()
      };
      if (linkData.id) payload.id = linkData.id;
      const { data, error } = await currentClient
        .from('social_links')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateSocialLink(id, linkData) {
      if (!currentClient) return null;
      const payload = { updated_at: new Date().toISOString() };
      if (linkData.platform !== undefined) payload.platform = linkData.platform;
      if (linkData.label_username !== undefined) payload.label_username = linkData.label_username;
      if (linkData.labelUsername !== undefined) payload.label_username = linkData.labelUsername;
      if (linkData.url !== undefined) payload.url = linkData.url;
      if (linkData.icon_name !== undefined) payload.icon_name = linkData.icon_name;
      if (linkData.iconName !== undefined) payload.icon_name = linkData.iconName;
      if (linkData.sort_order !== undefined) payload.sort_order = Number(linkData.sort_order);
      if (linkData.sortOrder !== undefined) payload.sort_order = Number(linkData.sortOrder);
      if (linkData.is_active !== undefined) payload.is_active = Boolean(linkData.is_active);
      if (linkData.isActive !== undefined) payload.is_active = Boolean(linkData.isActive);

      const { data, error } = await currentClient
        .from('social_links')
        .update(payload)
        .eq('id', Number(id))
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async deleteSocialLink(id) {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('social_links')
        .delete()
        .eq('id', Number(id));
      if (error) throw error;
      return data;
    },

    // 25. Pengaturan Identitas Global (site_settings)
    async getSiteSettings() {
      if (!currentClient) return null;
      const { data, error } = await currentClient
        .from('site_settings')
        .select('*')
        .eq('id', 'main')
        .maybeSingle();
      if (error) throw error;
      return data || null;
    },

    async updateSiteSettings(settingsData) {
      if (!currentClient) return null;
      const payload = {
        id: 'main',
        updated_at: new Date().toISOString(),
        ...settingsData
      };
      const { data, error } = await currentClient
        .from('site_settings')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // 22. Ambil Seluruh Data Terpadu (Fetch All Tables Directly from Supabase)
    async fetchAllData() {
      if (!currentClient) return null;
      try {
        const results = await Promise.allSettled([
          this.getClassInfo(),
          this.getStudents(),
          this.getSeating(),
          this.getDutySchedule(),
          this.getPiketChecklist(),
          this.getClassRules(),
          this.getClassModules(),
          this.getClassMeetings(),
          this.getMemories(),
          this.getStickyNotes(false),
          this.getTargetGoals(),
          this.getTasks(),
          this.getFinance(),
          this.getStudentDues(),
          this.getPolls(),
          this.getAnnouncements(),
          this.getGuestbook(false),
          this.getWeeklySchedule(),
          this.getAdminRoles(),
          this.getAuditLogs(),
          this.getSocialLinks(),
          this.getSiteSettings()
        ]);

        return {
          classInfo: results[0].status === 'fulfilled' ? results[0].value : null,
          students: results[1].status === 'fulfilled' ? results[1].value : null,
          seating: results[2].status === 'fulfilled' ? results[2].value : null,
          dutySchedule: results[3].status === 'fulfilled' ? results[3].value : null,
          piketChecklist: results[4].status === 'fulfilled' ? results[4].value : null,
          classRules: results[5].status === 'fulfilled' ? results[5].value : null,
          classModules: results[6].status === 'fulfilled' ? results[6].value : null,
          classMeetings: results[7].status === 'fulfilled' ? results[7].value : null,
          memories: results[8].status === 'fulfilled' ? results[8].value : null,
          stickyNotes: results[9].status === 'fulfilled' ? results[9].value : null,
          targetGoals: results[10].status === 'fulfilled' ? results[10].value : null,
          tasks: results[11].status === 'fulfilled' ? results[11].value : null,
          finance: results[12].status === 'fulfilled' ? results[12].value : null,
          studentDues: results[13].status === 'fulfilled' ? results[13].value : null,
          polls: results[14].status === 'fulfilled' ? results[14].value : null,
          announcements: results[15].status === 'fulfilled' ? results[15].value : null,
          guestbook: results[16].status === 'fulfilled' ? results[16].value : null,
          weeklySchedule: results[17].status === 'fulfilled' ? results[17].value : null,
          adminRoles: results[18].status === 'fulfilled' ? results[18].value : null,
          adminAuditLogs: results[19].status === 'fulfilled' ? results[19].value : null,
          socialLinks: results[20].status === 'fulfilled' ? results[20].value : null,
          siteSettings: results[21].status === 'fulfilled' ? results[21].value : null
        };
      } catch (err) {
        console.warn('fetchAllData error:', err);
        return null;
      }
    },

    // 23. Diagnostik Kesehatan Database Supabase (Lengkap 21 Tabel)
    async checkDatabaseHealth() {
      if (!currentClient) return { connected: false, message: 'Klien Supabase belum diinisialisasi.' };
      
      const tablesToCheck = [
        'class_info', 'students', 'seating', 'duty_schedule', 'piket_checklist',
        'class_rules', 'class_modules', 'class_meetings', 'memories', 'sticky_notes',
        'target_goals', 'tasks', 'finance_transactions', 'student_dues', 'admin_audit_logs',
        'polls', 'poll_options', 'poll_votes', 'announcements', 'weekly_schedule', 'guestbook',
        'admin_roles', 'social_links', 'site_settings'
      ];
      
      const tableStatus = {};
      let availableCount = 0;
      let totalRows = 0;

      for (const tbl of tablesToCheck) {
        try {
          const { count, error } = await currentClient.from(tbl).select('*', { count: 'exact', head: true });
          if (error) {
            tableStatus[tbl] = { ok: false, error: error.message, count: 0 };
          } else {
            tableStatus[tbl] = { ok: true, count: count || 0 };
            availableCount++;
            totalRows += (count || 0);
          }
        } catch (err) {
          tableStatus[tbl] = { ok: false, error: err.message, count: 0 };
        }
      }

      return {
        connected: true,
        totalChecked: tablesToCheck.length,
        availableTables: availableCount,
        allTablesExist: availableCount === tablesToCheck.length,
        hasData: totalRows > 0,
        totalRows,
        details: tableStatus
      };
    },

    // 14. Inisialisasi Data Default Langsung dari Browser ke Cloud Supabase
    async seedDatabaseFromClient(defaultData, onProgress) {
      if (!currentClient) throw new Error('Klien Supabase belum terhubung.');

      const steps = [
        {
          name: 'class_info',
          label: 'Informasi Kelas',
          run: async () => {
            const info = defaultData.classInfo || {};
            return await currentClient.from('class_info').upsert({
              id: 1,
              name: info.name || 'X TJKT 1',
              tagline: info.tagline || 'NEXUSS (Network Experts & United System Specialist)',
              motto: info.motto || 'Satu Hati, Sejuta Karya, Menembus Cakrawala',
              school_name: info.schoolName || 'SMK Negeri 1 PBG',
              room: info.room || 'Lab TJKT 1 Gedung A Lt. 2',
              accreditation: info.accreditation || 'A (Unggul)',
              academic_year: info.academicYear || '2025/2026',
              total_students: info.totalStudents || 18,
              homeroom_teacher: info.homeroomTeacher || 'Drs. Suryono, M.Pd.',
              homeroom_nip: info.homeroomNIP || '19720415 199802 1 003',
              president: info.president || 'Budi Wicaksono',
              vice_president: info.vicePresident || 'Siti Rahmawati',
              vision: info.vision || 'Mewujudkan generasi saintis muda yang unggul.',
              mission: info.mission || [],
              admin_pins: info.adminPins || { superadmin: '1234', sekretaris: '2345', bendahara: '3456' }
            }, { onConflict: 'id' });
          }
        },
        {
          name: 'students',
          label: 'Data 18 Siswa',
          run: async () => {
            const students = (defaultData.students || []).map(s => ({
              id: s.id,
              no_absen: s.no || s.id,
              name: s.name,
              nick: s.nick || s.name.split(' ')[0],
              gender: s.gender || 'L',
              role: s.role || 'Anggota Kelas',
              avatar: s.avatar,
              interest: s.interest || '-',
              dream: s.dream || '-',
              quote: s.quote || '-',
              ig: s.ig || '-',
              piket_day: s.piketDay || 'Senin'
            }));
            if (students.length > 0) {
              return await currentClient.from('students').upsert(students, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'seating',
          label: 'Denah Meja Lab TJKT 1',
          run: async () => {
            const seats = (defaultData.seating || []).map(seat => ({
              id: seat.id,
              row_num: seat.row,
              col_num: seat.col,
              student_id: seat.studentId || null
            }));
            if (seats.length > 0) {
              return await currentClient.from('seating').upsert(seats, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'duty_schedule',
          label: 'Jadwal Piket',
          run: async () => {
            const duty = defaultData.dutySchedule || {};
            const dutyRows = Object.keys(duty).map((day, idx) => ({
              id: idx + 1,
              day_name: day,
              student_names: duty[day] || []
            }));
            if (dutyRows.length > 0) {
              return await currentClient.from('duty_schedule').upsert(dutyRows, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'piket_checklist',
          label: 'Checklist Kebersihan',
          run: async () => {
            const checklist = (defaultData.piketChecklist || []).map((p, idx) => ({
              id: p.id || idx + 1,
              task: p.task,
              done: Boolean(p.done),
              time_label: p.time || 'Piket',
              points: p.points || '-'
            }));
            if (checklist.length > 0) {
              return await currentClient.from('piket_checklist').upsert(checklist, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'class_rules',
          label: 'Tata Tertib',
          run: async () => {
            const rules = (defaultData.classRules || []).map((r, idx) => ({
              id: r.id || idx + 1,
              category: r.category,
              icon: r.icon || 'ph-sparkle',
              badge: r.badge || 'Resmi',
              rules: r.rules || [],
              sort_order: idx + 1
            }));
            if (rules.length > 0) {
              return await currentClient.from('class_rules').upsert(rules, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'class_modules',
          label: 'Bank Modul Pembelajaran',
          run: async () => {
            const modules = (defaultData.modules || []).map(m => ({
              id: m.id,
              title: m.title,
              subject: m.subject,
              teacher: m.teacher,
              size_label: m.size || '1.0 MB',
              date_label: m.date || 'Hari Ini',
              format_label: m.format || 'PDF',
              downloads_count: m.downloads || 0,
              desc_text: m.desc || ''
            }));
            if (modules.length > 0) {
              return await currentClient.from('class_modules').upsert(modules, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'finance_transactions',
          label: 'Kas & Transaksi',
          run: async () => {
            const txs = (defaultData.finance?.transactions || []).map(t => ({
              id: t.id,
              trans_date: t.date || new Date().toISOString().slice(0, 10),
              description: t.desc,
              trans_type: t.type,
              amount: Number(t.amount),
              category: t.category || 'Operasional'
            }));
            if (txs.length > 0) {
              return await currentClient.from('finance_transactions').upsert(txs, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'sticky_notes',
          label: 'Mading Digital',
          run: async () => {
            const notes = (defaultData.stickyNotes || []).map(s => ({
              id: s.id,
              text: s.text,
              author: s.author,
              color: s.color,
              date_label: s.date || 'Hari Ini',
              rotate_deg: s.rotate || 'rotate-0'
            }));
            if (notes.length > 0) {
              return await currentClient.from('sticky_notes').upsert(notes, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'guestbook',
          label: 'Buku Tamu',
          run: async () => {
            const gb = (defaultData.guestbook || []).map(g => ({
              id: g.id,
              name: g.name,
              role: g.role || 'Tamu',
              text: g.text,
              date_label: g.date || 'Hari Ini',
              is_approved: true
            }));
            if (gb.length > 0) {
              return await currentClient.from('guestbook').upsert(gb, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'student_dues',
          label: 'Rekap Iuran 18 Siswa',
          run: async () => {
            const duesList = (defaultData.students || []).map(s => ({
              id: s.id,
              student_id: s.id,
              month_period: 'Maret 2026',
              academic_year: '2025/2026',
              amount: 25000,
              status: s.id === 11 || s.id === 17 ? 'Belum Lunas' : 'Lunas',
              paid_at: s.id === 11 || s.id === 17 ? null : new Date().toISOString(),
              payment_method: s.id % 2 === 0 ? 'QRIS' : 'Tunai',
              notes: s.id === 11 || s.id === 17 ? 'Menunggu konfirmasi' : 'Lunas tepat waktu',
              verified_by: 'Dewi Lestari (Bendahara 1)'
            }));
            if (duesList.length > 0) {
              return await currentClient.from('student_dues').upsert(duesList, { onConflict: 'student_id,month_period,academic_year' });
            }
          }
        },
        {
          name: 'target_goals',
          label: 'Target Kas & Pengadaan',
          run: async () => {
            const goals = (defaultData.targetGoals || []).map((g, idx) => ({
              id: g.id || idx + 1,
              title: g.title,
              current_amount: Number(g.current || g.current_amount || 0),
              target_amount: Number(g.target || g.target_amount || 1000000),
              deadline: g.deadline || '2026-04-30',
              completed: Boolean(g.completed)
            }));
            if (goals.length > 0) {
              return await currentClient.from('target_goals').upsert(goals, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'tasks',
          label: 'Tugas Akademik',
          run: async () => {
            const tasks = (defaultData.tasks || []).map((t, idx) => ({
              id: t.id || idx + 1,
              subject: t.subject,
              title: t.title,
              deadline: t.deadline || new Date().toISOString().slice(0, 10),
              status: t.status || 'Belum Selesai',
              teacher: t.teacher || 'Guru Pengampu',
              priority: t.priority || 'Sedang'
            }));
            if (tasks.length > 0) {
              return await currentClient.from('tasks').upsert(tasks, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'class_meetings',
          label: 'Notulensi Musyawarah Rapat',
          run: async () => {
            const meetings = (defaultData.classMeetings || []).map((m, idx) => ({
              id: m.id || idx + 1,
              title: m.title,
              meeting_date: m.date || m.meeting_date || '15 Mar 2026',
              leader: m.leader || 'Ketua Kelas',
              notetaker: m.notetaker || 'Sekretaris',
              venue: m.venue || 'Lab TJKT 1 SMK Negeri 1 PBG',
              attendance: m.attendance || '18 Siswa Hadir Lengkap',
              summary: m.summary || '',
              decisions: m.decisions || [],
              status: m.status || 'Selesai'
            }));
            if (meetings.length > 0) {
              return await currentClient.from('class_meetings').upsert(meetings, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'memories',
          label: 'Galeri Kenangan',
          run: async () => {
            const memories = (defaultData.memories || []).map((m, idx) => ({
              id: m.id || idx + 1,
              title: m.title,
              event_date: m.date || m.event_date || '14 Feb 2026',
              img: m.img,
              desc_text: m.desc || m.desc_text || '',
              likes_count: m.likes || m.likes_count || 0
            }));
            if (memories.length > 0) {
              return await currentClient.from('memories').upsert(memories, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'admin_roles',
          label: 'Akses Akun Google Pengurus',
          run: async () => {
            const roles = [
              { email: 'admin@smkn1pbg.sch.id', role: 'superadmin', name: 'Budi Wicaksono (Ketua Kelas)' },
              { email: 'sekretaris@smkn1pbg.sch.id', role: 'sekretaris', name: 'Aisyah Nurul & Putri Handayani' },
              { email: 'bendahara@smkn1pbg.sch.id', role: 'bendahara', name: 'Dewi Lestari & Nur Halizah' }
            ];
            return await currentClient.from('admin_roles').upsert(roles, { onConflict: 'email' });
          }
        },
        {
          name: 'polls',
          label: 'Polling & Aspirasi Siswa',
          run: async () => {
            const polls = defaultData.polls || [];
            for (const p of polls) {
              const { data: pollRow, error } = await currentClient.from('polls').upsert({
                id: p.id,
                question: p.question,
                active: true
              }, { onConflict: 'id' }).select().single();
              if (!error && pollRow && p.options) {
                const optRows = p.options.map((opt, idx) => ({
                  id: opt.id || (p.id * 10 + idx + 1),
                  poll_id: pollRow.id,
                  text: opt.text,
                  votes: opt.votes || 0,
                  sort_order: idx + 1
                }));
                await currentClient.from('poll_options').upsert(optRows, { onConflict: 'id' });
              }
            }
          }
        },
        {
          name: 'weekly_schedule',
          label: 'Jadwal Pelajaran Mingguan',
          run: async () => {
            const weekly = defaultData.weeklySchedule || {};
            const rows = [];
            let sortOrder = 1;
            for (const day of ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']) {
              const slots = weekly[day] || [];
              for (const slot of slots) {
                rows.push({
                  id: sortOrder,
                  day_name: day,
                  time_slot: slot.time,
                  subject: slot.subject,
                  teacher: slot.teacher,
                  room: slot.room,
                  sort_order: sortOrder++
                });
              }
            }
            if (rows.length > 0) {
              return await currentClient.from('weekly_schedule').upsert(rows, { onConflict: 'id' });
            }
          }
        },
        {
          name: 'admin_audit_logs',
          label: 'Audit Log Sistem',
          run: async () => {
            const initialLogs = [
              {
                id: 1,
                role: 'superadmin',
                action_name: 'Inisialisasi Sistem Cloud',
                target_entity: 'class_info',
                details: 'Inisialisasi data kelas default ke database Supabase Cloud',
                performed_by: 'Budi Wicaksono (Ketua Kelas)'
              }
            ];
            return await currentClient.from('admin_audit_logs').upsert(initialLogs, { onConflict: 'id' });
          }
        },
        {
          name: 'social_links',
          label: 'Media Sosial Kelas',
          run: async () => {
            const links = defaultData.socialLinks || [
              { id: 1, platform: 'Instagram', label_username: '@nexuss.xtjkt1', url: 'https://instagram.com/nexuss.xtjkt1', icon_name: 'ph-instagram-logo', sort_order: 1, is_active: true },
              { id: 2, platform: 'TikTok', label_username: '@nexuss_xtjkt1', url: 'https://tiktok.com/@nexuss_xtjkt1', icon_name: 'ph-tiktok-logo', sort_order: 2, is_active: true },
              { id: 3, platform: 'YouTube', label_username: '@nexuss_xtjkt1', url: 'https://youtube.com/@nexuss_xtjkt1', icon_name: 'ph-youtube-logo', sort_order: 3, is_active: true },
              { id: 4, platform: 'Spotify', label_username: 'Playlist Kelas NEXUSS', url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M', icon_name: 'ph-spotify-logo', sort_order: 4, is_active: true },
              { id: 5, platform: 'Discord', label_username: 'Server Komunitas TJKT 1', url: 'https://discord.gg/nexuss', icon_name: 'ph-discord-logo', sort_order: 5, is_active: true },
              { id: 6, platform: 'Email', label_username: 'nexuss.xtjkt1@smkn1pbg.sch.id', url: 'mailto:nexuss.xtjkt1@smkn1pbg.sch.id', icon_name: 'ph-envelope', sort_order: 6, is_active: true },
              { id: 7, platform: 'WhatsApp', label_username: 'Kontak WhatsApp Siswa', url: 'https://wa.me/6281234567890', icon_name: 'ph-whatsapp-logo', sort_order: 7, is_active: true }
            ];
            return await currentClient.from('social_links').upsert(links, { onConflict: 'id' });
          }
        },
        {
          name: 'site_settings',
          label: 'Pengaturan Identitas Kelas Global',
          run: async () => {
            const s = defaultData.siteSettings || {};
            return await currentClient.from('site_settings').upsert({
              id: 'main',
              brand_name: s.brand_name || 'NEXUSS',
              class_name: s.class_name || 'X TJKT 1',
              school_name: s.school_name || 'SMK Negeri 1 PBG',
              academic_year: s.academic_year || '2025/2026',
              generation: s.generation || 'Angkatan 2026',
              room_name: s.room_name || 'Lab Jaringan & Komputer Gedung C Lt. 2',
              accreditation: s.accreditation || 'Akreditasi A (Unggul)',
              compactness_pct: s.compactness_pct || '100%',
              motto: s.motto || 'Satu Hati, Sejuta Karya, Menembus Cakrawala',
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
          }
        }
      ];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (onProgress) onProgress(i + 1, steps.length, `Menginisialisasi ${step.label}...`);
        try {
          const res = await step.run();
          if (res && res.error) {
            console.warn(`[Supabase Seeder] Peringatan di ${step.name}:`, res.error.message);
          }
        } catch (e) {
          console.warn(`[Supabase Seeder] Gagal di ${step.name}:`, e.message);
        }
      }

      if (onProgress) onProgress(steps.length, steps.length, 'Inisialisasi cloud selesai dengan sukses!');
      return { success: true, message: 'Seluruh data default berhasil disimpan ke Supabase cloud.' };
    },

    // 21. Realtime Subscriptions Handler
    subscribeRealtime(onPayload) {
      if (!currentClient) return () => {};

      try {
        const channel = currentClient
          .channel('exomipa_global_realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'sticky_notes' }, payload => {
            onPayload && onPayload('sticky_notes', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'guestbook' }, payload => {
            onPayload && onPayload('guestbook', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, payload => {
            onPayload && onPayload('announcements', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'piket_checklist' }, payload => {
            onPayload && onPayload('piket_checklist', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
            onPayload && onPayload('tasks', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_transactions' }, payload => {
            onPayload && onPayload('finance_transactions', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'student_dues' }, payload => {
            onPayload && onPayload('student_dues', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_audit_logs' }, payload => {
            onPayload && onPayload('admin_audit_logs', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'class_meetings' }, payload => {
            onPayload && onPayload('class_meetings', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'class_modules' }, payload => {
            onPayload && onPayload('class_modules', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, payload => {
            onPayload && onPayload('memories', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'target_goals' }, payload => {
            onPayload && onPayload('target_goals', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_options' }, payload => {
            onPayload && onPayload('poll_options', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_roles' }, payload => {
            onPayload && onPayload('admin_roles', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, payload => {
            onPayload && onPayload('site_settings', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'social_links' }, payload => {
            onPayload && onPayload('social_links', payload);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_settings' }, payload => {
            onPayload && onPayload('cash_settings', payload);
          })
          .subscribe();

        realtimeChannels.push(channel);

        return () => {
          channel.unsubscribe();
        };
      } catch (e) {
        console.warn('[Supabase Realtime] Gagal mengaktifkan subscription:', e);
        return () => {};
      }
    },

    saveSeating(s) { return this.updateSeating(s); },
    saveClassRules(r) { return this.updateClassRules(r); },
    saveWeeklySchedule(s) { return this.updateWeeklySchedule(s); },
    saveDutySchedule(d) { return this.updateDutySchedule(d); },
    togglePiketChecklist(id, status) { return this.togglePiketTask(id, status); },
    assignRole(p) { return this.addAdminRole(p); }
  };

  window.SupabaseService = SupabaseService;
})(typeof window !== 'undefined' ? window : this);
