import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../../context/AppContext.jsx';

// --- Component: Toast Notification ---
const ToastNotification=()=>{const{toast}=useContext(AppContext);if(!toast)return null;return/*#__PURE__*/React.createElement("div",{className:"fixed bottom-6 right-6 z-50 fade-in"},/*#__PURE__*/React.createElement("div",{className:"flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 ring-1 ring-orange-500/20"},/*#__PURE__*/React.createElement("i",{className:"ph-fill ph-check-circle text-emerald-400 text-lg"}),/*#__PURE__*/React.createElement("span",null,toast)));};

export default ToastNotification;
