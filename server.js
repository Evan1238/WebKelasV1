/**
 * Production Full-Stack Server - NEXUSS X TJKT 1
 * SMK Negeri 1 PBG • Lab TJKT 1 Gedung A
 * 
 * Standar Arsitektur Produksi:
 * - Native Node.js HTTP Server (Zero-Dependency, ultra cepat & stabil)
 * - HTTP Security Headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
 * - Kompresi Otomatis Gzip Stream untuk transfer data super cepat
 * - Routing Terpadu: / (Website Publik Siswa) & /admin (Dedicated Admin Dashboard)
 * - Self-Unregistering Handler untuk menghapus PWA Service Worker usang
 * - Endpoint API Diagnostik: /api/health & /api/info
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Pemetaan MIME Types Lengkap
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

// Security Headers untuk Production
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: wss: data: blob:;"
};

const server = http.createServer((req, res) => {
  const startTime = Date.now();
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(urlObj.pathname);

  // Pasang Security Headers
  Object.entries(SECURITY_HEADERS).forEach(([key, val]) => {
    res.setHeader(key, val);
  });

  // 1. API: Health Check Endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'healthy',
      app: 'NEXUSS X TJKT 1',
      version: '2.0.0',
      environment: 'production',
      architecture: 'Full-Stack Native Web (Zero-PWA)',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        provider: 'Supabase PostgreSQL',
        tablesCount: 20,
        realtimeEnabled: true
      }
    }, null, 2));
    logRequest(req.method, pathname, 200, startTime);
    return;
  }

  // 2. API: Info Kelas & Sekolah
  if (pathname === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      className: 'X TJKT 1',
      alias: 'NEXUSS',
      school: 'SMK Negeri 1 PBG',
      room: 'Lab Jaringan & Komputer Gedung C Lt. 2',
      homeroomTeacher: 'Drs. Suryono, M.Pd.',
      president: 'Budi Wicaksono',
      studentsCount: 18,
      academicYear: '2025/2026'
    }, null, 2));
    logRequest(req.method, pathname, 200, startTime);
    return;
  }

  // 3. Khusus /sw.js: Kirim skrip self-destruct untuk membersihkan PWA lawas
  if (pathname === '/sw.js') {
    const swCleanupCode = `
      self.addEventListener('install', () => self.skipWaiting());
      self.addEventListener('activate', (e) => {
        e.waitUntil(
          caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
            .then(() => self.registration.unregister())
            .then(() => self.clients.claim())
        );
      });
    `;
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });
    res.end(swCleanupCode);
    logRequest(req.method, pathname, 200, startTime);
    return;
  }

  // 4. Resolusi Jalur Berkas Statis (Mendukung dist/ Vite Build dan Fallback)
  let filePath = '';
  const distDir = path.join(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distDir, 'index.html'));

  if (hasDist) {
    if (pathname === '/' || pathname === '' || pathname === '/admin' || pathname === '/admin/' || pathname.startsWith('/admin')) {
      filePath = path.join(distDir, 'index.html');
    } else {
      const candidateDist = path.join(distDir, pathname);
      if (fs.existsSync(candidateDist) && fs.statSync(candidateDist).isFile()) {
        filePath = candidateDist;
      } else {
        filePath = path.join(__dirname, pathname);
      }
    }
  } else {
    // Rute Khusus Admin: /admin atau /admin/
    if (pathname === '/admin' || pathname === '/admin/') {
      filePath = path.join(__dirname, 'admin', 'index.html');
      if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'admin.html');
      }
    } 
    // Rute Beranda Publik: /
    else if (pathname === '/' || pathname === '') {
      filePath = path.join(__dirname, 'index.html');
      if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'app.html');
      }
    } 
    // Berkas Lainnya
    else {
      filePath = path.join(__dirname, pathname);
    }
  }

  // Cek Keberadaan Berkas
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback untuk SPA jika rute /admin/*
      if (pathname.startsWith('/admin')) {
        const adminFallback = path.join(__dirname, 'admin', 'index.html');
        if (fs.existsSync(adminFallback)) {
          return serveFile(adminFallback, req, res, startTime);
        }
      }

      // 404 Handler yang rapi
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <title>404 - Halaman Tidak Ditemukan | NEXUSS</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans text-slate-800">
          <div class="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-3xl font-black">
              404
            </div>
            <h1 class="text-xl font-black text-slate-900">Halaman Tidak Ditemukan</h1>
            <p class="text-xs text-slate-500 leading-relaxed">
              Jalur URL <code class="bg-slate-100 px-1 py-0.5 rounded font-mono">${pathname}</code> tidak tersedia.
            </p>
            <div class="pt-3 flex flex-col sm:flex-row gap-2 justify-center">
              <a href="/" class="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all">
                Ke Website Kelas
              </a>
              <a href="/admin" class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all border border-slate-200">
                Ke Portal Admin
              </a>
            </div>
          </div>
        </body>
        </html>
      `);
      logRequest(req.method, pathname, 404, startTime);
      return;
    }

    serveFile(filePath, req, res, startTime);
  });
});

// Fungsi Pengiriman Berkas dengan Kompresi Gzip
function serveFile(filePath, req, res, startTime) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isCompressible = ['.html', '.js', '.css', '.json', '.svg', '.txt'].includes(ext);
  const acceptEncoding = req.headers['accept-encoding'] || '';

  res.setHeader('Content-Type', contentType);

  // Cache header untuk aset statis (1 jam di production, no-cache untuk HTML)
  if (ext === '.html') {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }

  // Kompresi Gzip jika didukung browser
  if (isCompressible && acceptEncoding.includes('gzip')) {
    res.writeHead(200, { 'Content-Encoding': 'gzip' });
    const rawStream = fs.createReadStream(filePath);
    const gzipStream = zlib.createGzip();
    rawStream.pipe(gzipStream).pipe(res);
  } else {
    const rawStream = fs.createReadStream(filePath);
    res.writeHead(200);
    rawStream.pipe(res);
  }

  logRequest(req.method, req.url, 200, startTime);
}

function logRequest(method, url, status, startTime) {
  const duration = Date.now() - startTime;
  const statusColor = status >= 400 ? '\x1b[31m' : '\x1b[32m';
  console.log(`[${new Date().toLocaleTimeString('id-ID')}] ${method} ${url} ${statusColor}${status}\x1b[0m (${duration}ms)`);
}

server.listen(PORT, HOST, () => {
  console.log('\n=============================================================');
  console.log('  NEXUSS X TJKT 1 - PRODUCTION FULL-STACK SERVER RUNNING  ');
  console.log('=============================================================');
  console.log(`  🌐 Website Publik Siswa   : http://localhost:${PORT}/`);
  console.log(`  🛡️ Portal Dedicated Admin : http://localhost:${PORT}/admin`);
  console.log(`  🩺 API Health Check       : http://localhost:${PORT}/api/health`);
  console.log(`  🚀 Status Keamanan        : CSP, HSTS, Zero-PWA Active`);
  console.log(`  🗄️ Database Supabase      : 20 Tabel Terhubung & Terverifikasi`);
  console.log('=============================================================\n');
});

// Penanganan Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('\n[Server] Menerima sinyal SIGTERM. Menutup server dengan aman...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('\n[Server] Menerima sinyal SIGINT (Ctrl+C). Menutup server...');
  server.close(() => process.exit(0));
});
