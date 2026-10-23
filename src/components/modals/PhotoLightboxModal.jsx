import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Component: PhotoLightboxModal (Cinema Lightbox Image Viewer) ---
const PhotoLightboxModal = ({ photo, photos, onClose, onLike }) => {
  const [currentPhoto, setCurrentPhoto] = useState(photo);
  const modalContainerRef = useRef(null);
  const photoStageRef = useRef(null);
  const imageElementRef = useRef(null);

  // Touch gesture coordinates for swipe navigation
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  useEffect(() => {
    setCurrentPhoto(photo);
  }, [photo]);

  // Lock background scroll safely
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const list = photos && photos.length > 0 ? photos : [photo];
  const currentIndex = list.findIndex((p) => p.id === (currentPhoto?.id || photo?.id));
  const activeIdx = currentIndex !== -1 ? currentIndex : 0;
  const currentItem = list[activeIdx] || currentPhoto;

  // Otomatis tergulir ke layar tengah saat foto dibuka atau diganti
  const scrollToCenter = useCallback(() => {
    if (photoStageRef.current) {
      photoStageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
    if (modalContainerRef.current && photoStageRef.current) {
      const container = modalContainerRef.current;
      const stage = photoStageRef.current;
      const targetTop = stage.offsetTop - (container.clientHeight - stage.clientHeight) / 2;
      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToCenter();
    const t = setTimeout(scrollToCenter, 60);
    return () => clearTimeout(t);
  }, [currentPhoto?.id, scrollToCenter]);

  const handlePrev = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const prevIdx = (activeIdx - 1 + list.length) % list.length;
    setCurrentPhoto(list[prevIdx]);
  };

  const handleNext = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const nextIdx = (activeIdx + 1) % list.length;
    setCurrentPhoto(list[nextIdx]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, list]);

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

      // Require significant horizontal motion relative to vertical motion
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

  const handleDownload = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const link = document.createElement('a');
      link.href = currentItem.img;
      const cleanTitle = (currentItem.title || 'Dokumentasi_NEXUSS').replace(/[^a-zA-Z0-9]/g, '_');
      link.download = cleanTitle + '.svg';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(currentItem.img, '_blank');
    }
  };

  const currentLikes = (photos || []).find((m) => m.id === currentItem.id)?.likes ?? currentItem?.likes ?? 0;

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-center items-center p-2 sm:p-3 md:p-4 select-none overflow-y-auto custom-scrollbar touch-pan-y gap-2 sm:gap-3"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <div
        className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3 text-white py-1 shrink-0 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-orange-500/20 border border-orange-400/30">
            <i className="ph-bold ph-image text-base"></i>
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-xs sm:text-sm text-white tracking-tight truncate">
              Galeri Dokumentasi Resmi NEXUSS
            </h4>
            <p className="text-[10px] text-orange-400 font-mono font-semibold">
              Foto {activeIdx + 1} dari {list.length} Dokumentasi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onLike) onLike(currentItem.id);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            title="Sukai Dokumentasi Ini"
          >
            <i className="ph-fill ph-heart text-rose-500 text-sm animate-pulse"></i>
            <span className="text-xs font-semibold">{currentLikes}</span>
            <span className="hidden sm:inline text-xs font-semibold">Suka</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
            title="Unduh / Simpan Berkas Gambar"
          >
            <i className="ph-bold ph-download-simple text-sm text-orange-400"></i>
            <span>Simpan</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
            aria-label="Tutup Foto Viewer"
            title="Tutup (Esc)"
          >
            <i className="ph-bold ph-x text-base"></i>
          </button>
        </div>
      </div>

      {/* Main Image Stage (Compact Proportional Height - Tidak Memanjang ke Atas) */}
      <div
        ref={photoStageRef}
        className="relative flex items-center justify-center min-h-0 w-full max-w-4xl mx-auto px-1 sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {list.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1 sm:left-2 z-20 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-2xl bg-slate-900/80 hover:bg-orange-600 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-90 shadow-2xl cursor-pointer group"
            aria-label="Foto Sebelumnya"
            title="Foto Sebelumnya (Panah Kiri / Geser Kanan)"
          >
            <i className="ph-bold ph-caret-left text-lg sm:text-2xl group-hover:-translate-x-0.5 transition-transform"></i>
          </button>
        )}

        <div className="relative max-w-full max-h-[44vh] sm:max-h-[50vh] md:max-h-[56vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950 flex items-center justify-center group animate-photo-appear">
          <img
            ref={imageElementRef}
            src={currentItem.img}
            alt={currentItem.title}
            className="w-auto h-auto max-w-full max-h-[44vh] sm:max-h-[50vh] md:max-h-[56vh] object-contain rounded-xl transition-all duration-300"
          />
        </div>

        {list.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1 sm:right-2 z-20 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-2xl bg-slate-900/80 hover:bg-orange-600 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-90 shadow-2xl cursor-pointer group"
            aria-label="Foto Berikutnya"
            title="Foto Berikutnya (Panah Kanan / Geser Kiri)"
          >
            <i className="ph-bold ph-caret-right text-lg sm:text-2xl group-hover:translate-x-0.5 transition-transform"></i>
          </button>
        )}
      </div>

      {/* Bottom Metadata Caption Box (Bersih, Rapi, Tanpa Baris Thumbnail yang Rusak) */}
      <div
        className="w-full max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 text-white shadow-2xl shrink-0 space-y-1.5 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
              Dokumentasi TJKT 1
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[9px] sm:text-[10px] font-mono flex items-center gap-1">
              <i className="ph-bold ph-calendar text-orange-400"></i>
              <span>{currentItem.date}</span>
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:inline font-mono">
            Gunakan tombol panah ◀ ▶ untuk ganti foto
          </span>
          <span className="text-[10px] text-slate-400 font-mono sm:hidden flex items-center gap-1">
            <i className="ph-bold ph-arrows-left-right text-orange-400"></i>
            Geser layar ◀ ▶ untuk ganti foto
          </span>
        </div>

        <div className="space-y-0.5">
          <h3 className="text-xs sm:text-sm md:text-base font-black text-white tracking-tight leading-snug">
            {currentItem.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed">
            {currentItem.desc}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotoLightboxModal;
