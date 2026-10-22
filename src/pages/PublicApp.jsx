import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import AppEntranceLoader from '../components/layout/AppEntranceLoader.jsx';
import WebNavbar from '../components/layout/WebNavbar.jsx';
import WebFooter from '../components/layout/WebFooter.jsx';
import SocialMediaModal from '../components/modals/SocialMediaModal.jsx';
import MusicPlayerModal from '../components/modals/MusicPlayerModal.jsx';
import AdminLoginModal from '../components/modals/AdminLoginModal.jsx';
import ToastNotification from '../components/common/ToastNotification.jsx';
import HomeView from './public/HomeView.jsx';
import ProfilView from './public/ProfilView.jsx';
import SiswaView from './public/SiswaView.jsx';
import AkademikView from './public/AkademikView.jsx';
import KasView from './public/KasView.jsx';
import KomunitasView from './public/KomunitasView.jsx';
import AdminPanelView from './admin/AdminPanelView.jsx';

// --- Component: PublicApp (Public Class Website Root) ---
const PublicApp=()=>{const{activeTab}=useContext(AppContext);return/*#__PURE__*/React.createElement("div",{className:"flex flex-col min-h-screen"},/*#__PURE__*/React.createElement(AppEntranceLoader,null),/*#__PURE__*/React.createElement(WebNavbar,null),/*#__PURE__*/React.createElement("main",{className:"flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 page-enter",key:activeTab},activeTab==='Home'&&/*#__PURE__*/React.createElement(HomeView,null),activeTab==='Profil'&&/*#__PURE__*/React.createElement(ProfilView,null),activeTab==='Siswa'&&/*#__PURE__*/React.createElement(SiswaView,null),activeTab==='Akademik'&&/*#__PURE__*/React.createElement(AkademikView,null),activeTab==='Kas'&&/*#__PURE__*/React.createElement(KasView,null),activeTab==='Komunitas'&&/*#__PURE__*/React.createElement(KomunitasView,null)),/*#__PURE__*/React.createElement(WebFooter,null),/*#__PURE__*/React.createElement(MusicPlayerModal,null),/*#__PURE__*/React.createElement(SocialMediaModal,null),/*#__PURE__*/React.createElement(ToastNotification,null));};

export default PublicApp;
