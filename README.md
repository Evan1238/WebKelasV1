# KelasTugas

Website daftar tugas kelas (mobile-first, PWA) yang bisa dibungkus menjadi APK.

## Jalankan di komputer

Node.js belum wajib. Dari folder proyek:

```bash
python -m http.server 8080
```

Lalu buka `http://localhost:8080` di browser. Untuk pratinjau HP, pakai DevTools device toolbar (ikon HP) atau buka IP komputer dari HP yang satu Wi-Fi.

Kalau sudah install Node.js:

```bash
npm install
npm run dev
```

## Build produksi

```bash
npm run build
npm run preview
```

Folder hasil: `dist/`.

## Jadi aplikasi HP (APK)

Paling sederhana: **PWA**. Di Chrome Android buka situsnya (setelah di-host), lalu **Tambahkan ke layar utama**.

Agar benar-benar APK (Play Store / file .apk):

1. Install [Android Studio](https://developer.android.com/studio) dan JDK.
2. Dari folder proyek:

```bash
npm install
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init KelasTugas com.kelastugas.app --web-dir dist
npx cap add android
npx cap copy android
npx cap open android
```

3. Di Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

`vite.config.js` memakai `base: "./"` supaya aset jalan di WebView APK.
