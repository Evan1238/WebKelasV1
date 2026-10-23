import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../../context/AppContext.jsx';

// --- Component: SiswaView (Buku Tahunan & Direktori 18 Siswa) ---
const SiswaView = () => {
  const { students, siteSettings, activeStudentModal, setActiveStudentModal } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [selectedStudent, setSelectedStudent] = useState(activeStudentModal || null);

  const modalContainerRef = useRef(null);
  const dialogCardRef = useRef(null);

  // Touch gesture coordinates for swipe navigation on mobile
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    if (activeStudentModal) {
      setSelectedStudent(activeStudentModal);
    }
  }, [activeStudentModal]);

  // Lock background body scroll cleanly while modal is open
  useEffect(() => {
    if (!selectedStudent) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedStudent]);

  // Otomatis tergulir ke layar tengah saat modal biodata dibuka atau berpindah siswa
  const scrollToCenter = useCallback(() => {
    if (dialogCardRef.current) {
      dialogCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
    if (modalContainerRef.current && dialogCardRef.current) {
      const container = modalContainerRef.current;
      const card = dialogCardRef.current;
      const targetTop = card.offsetTop - (container.clientHeight - card.clientHeight) / 2;
      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    scrollToCenter();
    const t = setTimeout(scrollToCenter, 60);
    return () => clearTimeout(t);
  }, [selectedStudent?.id, scrollToCenter]);

  // Fungsi buka biodata siswa & otomatis gulir kartu ke layar tengah
  const handleOpenStudent = (student) => {
    const cardEl = document.getElementById(`student-card-${student.id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setSelectedStudent(student);
    if (setActiveStudentModal) setActiveStudentModal(student);
  };

  const currentIdx = (students || []).findIndex((s) => s.id === selectedStudent?.id);

  const handlePrev = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!students || students.length === 0) return;
    const prevIdx = (currentIdx - 1 + students.length) % students.length;
    if (students[prevIdx]) {
      setSelectedStudent(students[prevIdx]);
      if (setActiveStudentModal) setActiveStudentModal(students[prevIdx]);
    }
  };

  const handleNext = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!students || students.length === 0) return;
    const nextIdx = (currentIdx + 1) % students.length;
    if (students[nextIdx]) {
      setSelectedStudent(students[nextIdx]);
      if (setActiveStudentModal) setActiveStudentModal(students[nextIdx]);
    }
  };

  // Keyboard navigation for PC / Desktop
  useEffect(() => {
    if (!selectedStudent) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedStudent(null);
        if (setActiveStudentModal) setActiveStudentModal(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStudent, currentIdx, students, setActiveStudentModal]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    if (e.changedTouches && e.changedTouches[0]) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      // Require distinct horizontal swipe
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Filter students by search and category
  const filteredStudents = useMemo(() => {
    return (students || []).filter((s) => {
      const q = (searchQuery || '').trim().toLowerCase();
      const matchQuery = !q
        ? true
        : (s?.name || '').toLowerCase().includes(q) ||
          (s?.nick || '').toLowerCase().includes(q) ||
          (s?.interest || '').toLowerCase().includes(q) ||
          (s?.dream || '').toLowerCase().includes(q);
      if (!matchQuery) return false;
      if (filterCategory === 'Putra') return s.gender === 'L' || s.gender === 'Putra';
      if (filterCategory === 'Putri') return s.gender === 'P' || s.gender === 'Putri';
      if (filterCategory === 'Pengurus') return s.role !== 'Anggota Kelas';
      return true;
    });
  }, [students, searchQuery, filterCategory]);

  return (
    <div className="page-enter space-y-8 sm:space-y-10">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <span className="px-3 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200 uppercase tracking-wider">
            Buku Angkatan Digital
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Direktori {(students || []).length} Siswa {siteSettings?.brand_name || 'NEXUSS'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Potret dan rekam jejak {(students || []).length} siswa kelas {siteSettings?.class_name || 'X TJKT 1'}{' '}
            {siteSettings?.school_name || 'SMK Negeri 1 PBG'}. Mengenal{' '}
            {siteSettings?.student_interest_label ? siteSettings.student_interest_label.toLowerCase() : 'minat kejuruan'}
            , moto perjuangan, dan cita-cita masa depan.
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0 shadow-2xs">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block font-mono">
            {(students || []).length}
          </span>
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Siswa Terdaftar</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <i className="ph-bold ph-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="Cari siswa berdasarkan nama, panggilan, minat, atau cita-cita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-orange-500 transition-all placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200 transition-all cursor-pointer"
              title="Hapus pencarian"
            >
              <i className="ph-bold ph-x"></i>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80 shadow-2xs overflow-x-auto w-full md:w-auto custom-scrollbar touch-pan-x shrink-0">
          {['Semua', 'Putra', 'Putri', 'Pengurus'].map((cat) => {
            const isCatActive = filterCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 cursor-pointer ${
                  isCatActive
                    ? 'bg-white text-orange-600 shadow-sm border border-slate-200/90 font-extrabold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                {cat === 'Semua'
                  ? `Semua (${(students || []).length})`
                  : cat === 'Putra'
                  ? `Putra (${(students || []).filter((s) => s.gender === 'L' || s.gender === 'Putra').length})`
                  : cat === 'Putri'
                  ? `Putri (${(students || []).filter((s) => s.gender === 'P' || s.gender === 'Putri').length})`
                  : 'Pengurus'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            id={`student-card-${student.id}`}
            onClick={() => handleOpenStudent(student)}
            className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between card-hover scroll-mt-24"
          >
            <div>
              <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-slate-900/90 text-white font-mono text-[11px] font-bold border border-white/20 backdrop-blur-xs">
                  #{String(student.no || student.no_absen || student.id || 1).padStart(2, '0')}
                </span>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        student.gender === 'L' || student.gender === 'Putra'
                          ? 'bg-slate-900 text-white'
                          : 'bg-orange-600 text-white'
                      }`}
                    >
                      {student.gender === 'L' || student.gender === 'Putra' ? 'Putra' : 'Putri'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white/20 text-white text-[10px] font-medium backdrop-blur-xs">
                      {student.role}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base leading-snug truncate">{student.name}</h3>
                  <p className="text-[11px] text-orange-300 font-medium">"{student.nick}"</p>
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                <p className="text-xs text-slate-600 italic font-serif leading-relaxed line-clamp-2">
                  "{student.quote}"
                </p>
                <div className="space-y-1 text-xs pt-1 border-t border-slate-100">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[11px]">{siteSettings?.student_interest_label || 'Minat'}:</span>
                    <strong className="text-slate-800 text-right truncate max-w-[160px] text-[11px]">{student.interest}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[11px]">Cita-Cita:</span>
                    <strong className="text-orange-800 text-right truncate max-w-[160px] text-[11px]">{student.dream}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 pt-0">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenStudent(student);
                }}
                className="w-full py-2 rounded-xl bg-slate-50 group-hover:bg-orange-600 group-hover:text-white text-slate-700 text-xs font-bold text-center border border-slate-200/80 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Lihat Biodata Lengkap</span>
                <i className="ph-bold ph-arrow-right"></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Responsive Full Biodata Modal (Landscape Compact Profile - Tidak Memanjang ke Atas) */}
      {selectedStudent && (
        <div
          ref={modalContainerRef}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 fade-in select-none overflow-y-auto custom-scrollbar touch-pan-y"
          onClick={() => {
            setSelectedStudent(null);
            if (setActiveStudentModal) setActiveStudentModal(null);
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={dialogCardRef}
            className="bg-white rounded-2xl sm:rounded-3xl max-w-lg md:max-w-2xl lg:max-w-3xl w-full max-h-[85dvh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-5 md:p-6 shadow-2xl border border-slate-200/90 relative custom-scrollbar animate-photo-appear my-auto touch-pan-y"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => {
                setSelectedStudent(null);
                if (setActiveStudentModal) setActiveStudentModal(null);
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-500 transition-all cursor-pointer z-20 shadow-xs"
              aria-label="Tutup Biodata"
              title="Tutup (Esc)"
            >
              <i className="ph-bold ph-x text-sm sm:text-base"></i>
            </button>

            {/* Horizontal Identity Header: Avatar on Left, Identity Info on Right */}
            <div className="flex flex-row items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100 pr-8 sm:pr-10">
              {/* Avatar Square Rounded */}
              <div className="relative w-18 h-18 sm:w-22 sm:h-22 md:w-26 md:h-26 rounded-2xl overflow-hidden bg-slate-100 border-2 border-orange-200 shadow-md shrink-0">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/90 text-white font-mono text-[9px] sm:text-[10px] font-bold border border-white/20">
                  #{String(selectedStudent?.no || selectedStudent?.no_absen || selectedStudent?.id || 1).padStart(2, '0')}
                </span>
              </div>

              {/* Name, Nick, Badges, Instagram */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-mono font-extrabold uppercase tracking-wider">
                    Absen #{String(selectedStudent?.no || selectedStudent?.no_absen || selectedStudent?.id || 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      selectedStudent.gender === 'L' || selectedStudent.gender === 'Putra'
                        ? 'bg-slate-900 text-white'
                        : 'bg-orange-600 text-white'
                    }`}
                  >
                    {selectedStudent.gender === 'L' || selectedStudent.gender === 'Putra' ? 'Putra' : 'Putri'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                    {selectedStudent.role}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-950 tracking-tight leading-tight truncate">
                  {selectedStudent.name}
                </h2>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <p className="text-[11px] sm:text-xs text-orange-600 font-bold truncate">
                    Panggilan: <span className="text-slate-800 font-extrabold">"{selectedStudent.nick}"</span>
                  </p>
                  {selectedStudent.ig && (
                    <a
                      href={`https://instagram.com/${selectedStudent.ig.replace('@', '').trim()}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 hover:bg-pink-100 text-pink-700 text-[10px] sm:text-[11px] font-bold border border-pink-200/80 transition-all"
                    >
                      <i className="ph-bold ph-instagram-logo text-pink-600 text-xs"></i>
                      <span className="truncate max-w-[120px]">{selectedStudent.ig.startsWith('@') ? selectedStudent.ig : `@${selectedStudent.ig}`}</span>
                      <i className="ph-bold ph-arrow-square-out text-slate-400 text-[10px]"></i>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Section: 4 Compact Dossier Tiles (2x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 my-3 text-xs">
              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <i className="ph-bold ph-cpu text-xs sm:text-sm"></i>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {siteSettings?.student_interest_label || 'Minat Kejuruan'}
                  </span>
                  <p className="font-extrabold text-slate-900 text-[11px] sm:text-xs truncate">
                    {selectedStudent.interest || 'Teknologi Jaringan'}
                  </p>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <i className="ph-bold ph-rocket-launch text-xs sm:text-sm"></i>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cita-Cita Almamater
                  </span>
                  <p className="font-extrabold text-orange-800 text-[11px] sm:text-xs truncate">
                    {selectedStudent.dream || 'Network Engineer'}
                  </p>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <i className="ph-bold ph-broom text-xs sm:text-sm"></i>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Jadwal Piket
                  </span>
                  <p className="font-extrabold text-amber-900 text-[11px] sm:text-xs">
                    Hari {selectedStudent?.piketDay || selectedStudent?.piket_day || 'Senin'}
                  </p>
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <i className="ph-bold ph-identification-badge text-xs sm:text-sm"></i>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Status Kelas
                  </span>
                  <p className="font-extrabold text-slate-800 text-[11px] sm:text-xs truncate">
                    {siteSettings?.class_name || 'X TJKT 1'} • {selectedStudent.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Quote Banner: Compact 1-2 line stylish quote */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-orange-50/70 border border-orange-200/90 flex items-center gap-2.5">
              <i className="ph-fill ph-quotes text-orange-600 text-base sm:text-lg shrink-0"></i>
              <p className="text-[11px] sm:text-xs text-slate-800 font-serif italic leading-relaxed line-clamp-2">
                "{selectedStudent.quote}"
              </p>
            </div>

            {/* Bottom Navigation & Controls: Sleek and compact */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Siswa Sebelumnya (Panah Kiri / Geser Kanan)"
              >
                <i className="ph-bold ph-arrow-left"></i>
                <span className="hidden sm:inline">Sebelumnya</span>
                <span className="sm:hidden">Prev</span>
              </button>

              <div className="text-center">
                <span className="text-xs font-mono font-bold text-slate-600 block">
                  #{String(selectedStudent?.no || selectedStudent?.no_absen || selectedStudent?.id || 1).padStart(2, '0')}{' '}
                  dari {(students || []).length}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Gunakan tombol panah ◀ ▶ keyboard
                </span>
                <span className="text-[10px] text-slate-400 sm:hidden">
                  Geser layar ◀ ▶
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(null);
                    if (setActiveStudentModal) setActiveStudentModal(null);
                  }}
                  className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-xs cursor-pointer"
                  title="Tutup Modal (Esc)"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Siswa Berikutnya (Panah Kanan / Geser Kiri)"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <span className="sm:hidden">Next</span>
                  <i className="ph-bold ph-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiswaView;
