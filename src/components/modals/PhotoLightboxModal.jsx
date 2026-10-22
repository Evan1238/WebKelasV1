import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';

// --- Component: PhotoLightboxModal (Cinema Lightbox Image Viewer) ---
const PhotoLightboxModal=({photo,photos,onClose,onLike})=>{
  const[currentPhoto,setCurrentPhoto]=useState(photo);
  const modalContainerRef=useRef(null);
  const photoStageRef=useRef(null);
  const imageElementRef=useRef(null);

  useEffect(()=>{
    setCurrentPhoto(photo);
  },[photo]);

  // Lock background scroll and automatically move screen focus directly to the big photo
  useEffect(()=>{
    const originalOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';

    const moveScreenToPhoto=()=>{
      if(photoStageRef.current){
        photoStageRef.current.scrollIntoView({behavior:'smooth',block:'center'});
      }
      if(modalContainerRef.current){
        modalContainerRef.current.scrollTo({top:0,behavior:'smooth'});
      }
    };

    // Execute immediately and on next frame to guarantee smooth viewport alignment
    moveScreenToPhoto();
    const timer=setTimeout(moveScreenToPhoto,60);

    return()=>{
      document.body.style.overflow=originalOverflow;
      clearTimeout(timer);
    };
  },[]);

  // When photo changes (prev / next / thumbnail), smoothly focus screen to the photo
  useEffect(()=>{
    if(photoStageRef.current){
      photoStageRef.current.scrollIntoView({behavior:'smooth',block:'center'});
    }
  },[currentPhoto]);

  const list=photos&&photos.length>0?photos:[photo];
  const currentIndex=list.findIndex(p=>p.id===(currentPhoto?.id||photo?.id));
  const activeIdx=currentIndex!==-1?currentIndex:0;
  const currentItem=list[activeIdx]||currentPhoto;

  const handlePrev=e=>{
    if(e)e.stopPropagation();
    const prevIdx=(activeIdx-1+list.length)%list.length;
    setCurrentPhoto(list[prevIdx]);
  };

  const handleNext=e=>{
    if(e)e.stopPropagation();
    const nextIdx=(activeIdx+1)%list.length;
    setCurrentPhoto(list[nextIdx]);
  };

  useEffect(()=>{
    const handleKeyDown=e=>{
      if(e.key==='ArrowLeft')handlePrev();
      else if(e.key==='ArrowRight')handleNext();
      else if(e.key==='Escape')onClose();
    };
    window.addEventListener('keydown',handleKeyDown);
    return()=>window.removeEventListener('keydown',handleKeyDown);
  },[activeIdx,list]);

  const handleDownload=e=>{
    if(e)e.stopPropagation();
    try{
      const link=document.createElement('a');
      link.href=currentItem.img;
      const cleanTitle=(currentItem.title||'Dokumentasi_NEXUSS').replace(/[^a-zA-Z0-9]/g,'_');
      link.download=cleanTitle+'.svg';
      link.target='_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }catch(err){
      window.open(currentItem.img,'_blank');
    }
  };

  const currentLikes=(photos||[]).find(m=>m.id===currentItem.id)?.likes??currentItem?.likes??0;

  return/*#__PURE__*/React.createElement("div",{
    ref:modalContainerRef,
    className:"fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 fade-in select-none overflow-y-auto custom-scrollbar",
    onClick:onClose
  },
    /*#__PURE__*/React.createElement("div",{
      className:"w-full max-w-6xl mx-auto flex items-center justify-between gap-3 text-white py-1 shrink-0 z-10",
      onClick:e=>e.stopPropagation()
    },
      /*#__PURE__*/React.createElement("div",{className:"flex items-center gap-2.5 min-w-0"},
        /*#__PURE__*/React.createElement("div",{className:"w-8 h-8 rounded-lg bg-orange-600/90 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm"},
          /*#__PURE__*/React.createElement("i",{className:"ph-bold ph-image"})
        ),
        /*#__PURE__*/React.createElement("div",{className:"min-w-0"},
          /*#__PURE__*/React.createElement("h4",{className:"font-black text-xs sm:text-sm text-white tracking-tight truncate"},"Galeri Foto Resmi NEXUSS X TJKT 1"),
          /*#__PURE__*/React.createElement("p",{className:"text-[10px] sm:text-xs text-slate-400 font-mono"},"Foto ",activeIdx+1," dari ",list.length," Dokumentasi")
        )
      ),
      /*#__PURE__*/React.createElement("div",{className:"flex items-center gap-2 shrink-0"},
        /*#__PURE__*/React.createElement("button",{
          type:"button",
          onClick:()=>{if(onLike)onLike(currentItem.id);},
          className:"px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-400 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer",
          title:"Sukai Dokumentasi Ini"
        },
          /*#__PURE__*/React.createElement("i",{className:"ph-fill ph-heart text-rose-500 text-sm animate-pulse"}),
          /*#__PURE__*/React.createElement("span",null,currentLikes," Suka")
        ),
        /*#__PURE__*/React.createElement("button",{
          type:"button",
          onClick:handleDownload,
          className:"hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer",
          title:"Unduh / Simpan Berkas Gambar"
        },
          /*#__PURE__*/React.createElement("i",{className:"ph-bold ph-download-simple text-sm text-orange-400"}),
          /*#__PURE__*/React.createElement("span",null,"Simpan Foto")
        ),
        /*#__PURE__*/React.createElement("button",{
          type:"button",
          onClick:onClose,
          className:"min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer",
          "aria-label":"Tutup Foto Viewer",
          title:"Tutup (Esc)"
        },
          /*#__PURE__*/React.createElement("i",{className:"ph-bold ph-x text-lg"})
        )
      )
    ),
    /*#__PURE__*/React.createElement("div",{
      ref:photoStageRef,
      className:"relative flex-1 flex items-center justify-center my-auto min-h-0 py-2 sm:py-4 w-full max-w-6xl mx-auto px-2 sm:px-6 scroll-mt-6",
      onClick:e=>e.stopPropagation()
    },
      list.length>1&&/*#__PURE__*/React.createElement("button",{
        type:"button",
        onClick:handlePrev,
        className:"absolute left-1 sm:left-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/85 hover:bg-orange-600 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-90 shadow-2xl cursor-pointer group",
        "aria-label":"Foto Sebelumnya",
        title:"Foto Sebelumnya (Panah Kiri)"
      },
        /*#__PURE__*/React.createElement("i",{className:"ph-bold ph-caret-left text-2xl sm:text-3xl group-hover:-translate-x-0.5 transition-transform"})
      ),
      /*#__PURE__*/React.createElement("div",{
        className:"relative max-w-full max-h-[56vh] sm:max-h-[66vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950 flex items-center justify-center group animate-photo-appear"
      },
        /*#__PURE__*/React.createElement("img",{
          ref:imageElementRef,
          src:currentItem.img,
          alt:currentItem.title,
          className:"w-auto h-auto max-w-full max-h-[56vh] sm:max-h-[66vh] object-contain rounded-xl transition-all duration-300 transform scale-100"
        })
      ),
      list.length>1&&/*#__PURE__*/React.createElement("button",{
        type:"button",
        onClick:handleNext,
        className:"absolute right-1 sm:right-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/85 hover:bg-orange-600 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-90 shadow-2xl cursor-pointer group",
        "aria-label":"Foto Berikutnya",
        title:"Foto Berikutnya (Panah Kanan)"
      },
        /*#__PURE__*/React.createElement("i",{className:"ph-bold ph-caret-right text-2xl sm:text-3xl group-hover:translate-x-0.5 transition-transform"})
      )
    ),
    /*#__PURE__*/React.createElement("div",{
      className:"w-full max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 text-white shadow-2xl shrink-0 space-y-2.5 z-10",
      onClick:e=>e.stopPropagation()
    },
      /*#__PURE__*/React.createElement("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5"},
        /*#__PURE__*/React.createElement("div",{className:"flex flex-wrap items-center gap-2"},
          /*#__PURE__*/React.createElement("span",{className:"px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold uppercase tracking-wider"},"Dokumentasi TJKT 1"),
          /*#__PURE__*/React.createElement("span",{className:"px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1"},
            /*#__PURE__*/React.createElement("i",{className:"ph-bold ph-calendar text-orange-400"}),
            /*#__PURE__*/React.createElement("span",null,currentItem.date)
          )
        ),
        /*#__PURE__*/React.createElement("span",{className:"text-[11px] text-slate-400 hidden sm:inline font-mono"},
          "Navigasi: Tombol panah Kiri Kanan atau klik thumbnail"
        )
      ),
      /*#__PURE__*/React.createElement("div",{className:"space-y-1"},
        /*#__PURE__*/React.createElement("h3",{className:"text-sm sm:text-base lg:text-lg font-black text-white tracking-tight leading-snug"},
          currentItem.title
        ),
        /*#__PURE__*/React.createElement("p",{className:"text-xs sm:text-sm text-slate-300 leading-relaxed"},
          currentItem.desc
        )
      ),
      list.length>1&&/*#__PURE__*/React.createElement("div",{
        className:"flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar py-1"
      },
        list.map((item,idx)=>{
          const isActive=idx===activeIdx;
          return/*#__PURE__*/React.createElement("button",{
            key:item.id,
            type:"button",
            onClick:()=>setCurrentPhoto(item),
            className:"relative w-12 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer "+(isActive?"border-orange-500 ring-2 ring-orange-500/60 scale-105 opacity-100":"border-slate-700 opacity-50 hover:opacity-90"),
            title:item.title
          },
            /*#__PURE__*/React.createElement("img",{
              src:item.img,
              alt:item.title,
              className:"w-full h-full object-cover"
            })
          );
        })
      )
    )
  );
};

export default PhotoLightboxModal;
