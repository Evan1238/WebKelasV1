import React, { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import './lib/supabase.js';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { AppProvider } from './context/AppContext.jsx';
import App from './App.jsx';
import './assets/style.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AppProvider>
          <App />
        </AppProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
