import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import PublicApp from './pages/PublicApp.jsx';
import AdminApp from './pages/AdminApp.jsx';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      return p.includes('/admin') || p.endsWith('admin.html') || h.includes('#admin');
    }
    return false;
  });

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      setIsAdminRoute(p.includes('/admin') || p.endsWith('admin.html') || h.includes('#admin'));
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  return isAdminRoute ? <AdminApp /> : <PublicApp />;
}
