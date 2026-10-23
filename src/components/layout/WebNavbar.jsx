import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../../context/AppContext.jsx';

// --- Component: WebNavbar (Real School Website Navigation Header) ---
const WebNavbar = () => {
  const {
    activeTab,
    setActiveTab,
    setInitialLoading,
    setShowMusicModal,
    isPlayingMusic,
    siteSettings,
    socialLinks,
    setShowSocialModal
  } = useContext(AppContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on desktop resize or Escape key
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const navLinks = [
    { id: 'Home', label: 'Beranda', icon: 'ph-house' },
    { id: 'Profil', label: 'Profil', icon: 'ph-chalkboard-teacher' },
    { id: 'Siswa', label: 'Siswa', icon: 'ph-users' },
    { id: 'Akademik', label: 'Akademik', icon: 'ph-calendar' },
    { id: 'Kas', label: 'Kas', icon: 'ph-wallet' },
    { id: 'Komunitas', label: 'Mading & Galeri', icon: 'ph-images' }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            {/* Logo & School Identity */}
            <button
              onClick={() => handleNavClick('Home')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group shrink min-w-0 cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-md shadow-orange-500/20 border border-orange-400/30 group-hover:scale-105 transition-all shrink-0">
                <i className="ph-bold ph-graduation-cap"></i>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-black text-base sm:text-lg text-slate-950 tracking-tight leading-tight truncate">
                    {siteSettings?.brand_name || 'NEXUSS'}
                  </span>
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold shrink-0">
                    {siteSettings?.class_name || 'X TJKT 1'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight truncate">
                  {siteSettings?.school_name || 'SMK Negeri 1 PBG'}
                  <span className="hidden md:inline"> • {siteSettings?.room_name || 'Lab Jaringan Gedung C'}</span>
                </p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs shrink-0">
              {navLinks.map((link) => {
                const active = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-white text-orange-600 shadow-sm border border-slate-200/90 font-extrabold'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                    }`}
                  >
                    <i className={`ph-bold ${link.icon} text-xs ${active ? 'text-orange-600' : 'text-slate-400'}`}></i>
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action Icons & Mobile Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setShowMusicModal(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs active:scale-95 whitespace-nowrap shrink-0 group cursor-pointer ${
                  isPlayingMusic
                    ? 'bg-orange-50 border-orange-300 text-orange-800'
                    : 'bg-slate-100/80 hover:bg-orange-50 border-slate-200/90 hover:border-orange-200 text-slate-700 hover:text-orange-700'
                }`}
                title="Putar Audio Latar"
                aria-label="Audio Latar"
              >
                {isPlayingMusic ? (
                  <div className="flex items-end gap-0.5 h-3 px-0.5">
                    <span className="w-1 bg-orange-600 rounded-full equalizer-bar-1"></span>
                    <span className="w-1 bg-orange-600 rounded-full equalizer-bar-2"></span>
                    <span className="w-1 bg-orange-600 rounded-full equalizer-bar-3"></span>
                  </div>
                ) : (
                  <i className="ph-bold ph-headphones text-sm text-slate-500 group-hover:text-orange-600 transition-colors"></i>
                )}
                <span className="hidden sm:inline">
                  {isPlayingMusic ? 'Audio' : siteSettings?.audio_title || 'Audio'}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('Komunitas')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold transition-all shadow-sm shadow-orange-600/20 active:scale-95 whitespace-nowrap shrink-0 group cursor-pointer"
              >
                <i className="ph-bold ph-chats text-sm text-orange-200 group-hover:scale-110 transition-transform"></i>
                <span>Buku Tamu</span>
              </button>

              {/* Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden min-w-[42px] min-h-[42px] w-10.5 h-10.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-all active:scale-95 shrink-0 shadow-2xs cursor-pointer"
                aria-label="Toggle Menu Navigasi"
              >
                <i className={`ph-bold ${mobileMenuOpen ? 'ph-x' : 'ph-list'} text-xl text-slate-800`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu with bounded max-height, momentum scroll, and touch safety */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-8 shadow-2xl page-enter max-h-[calc(100dvh-4.5rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain touch-pan-y custom-scrollbar">
            <div className="space-y-1 mb-3">
              {navLinks.map((link) => {
                const active = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-2xs font-extrabold'
                        : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          active ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <i className={`ph-bold ${link.icon} text-sm`}></i>
                      </div>
                      <span className="text-sm font-bold">{link.label}</span>
                    </div>
                    {active ? (
                      <span className="px-2 py-0.5 rounded-md bg-orange-600 text-white text-[10px] font-bold">
                        Aktif
                      </span>
                    ) : (
                      <i className="ph-bold ph-caret-right text-xs text-slate-400"></i>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleNavClick('Komunitas')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-sm shadow-orange-600/20 active:scale-95 cursor-pointer"
              >
                <i className="ph-bold ph-chats text-sm text-orange-200"></i>
                <span>Tulis Buku Tamu Resmi</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowMusicModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 active:scale-95 cursor-pointer"
              >
                <i className="ph-bold ph-headphones text-orange-600"></i>
                <span>Audio Musik Latar</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowSocialModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 active:scale-95 cursor-pointer"
              >
                <i className="ph-bold ph-share-network text-orange-600"></i>
                <span>Media Sosial Kelas</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setInitialLoading(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 active:scale-95 cursor-pointer"
              >
                <i className="ph-bold ph-sparkle text-orange-600"></i>
                <span>Intro Animasi</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Tap-outside backdrop overlay to easily dismiss mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 sm:top-20 bg-slate-950/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default WebNavbar;
