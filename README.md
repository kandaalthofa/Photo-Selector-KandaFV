# KandaFV - Google Drive Photo Selector Platform

Aplikasi web full-stack modern untuk mempratinjau, menyeleksi foto Google Drive, menyalin daftar nama file, serta mengunduh foto terpilih dalam arsip **ZIP**.

---

## ⚡ Siap Download & Deploy ke Hostinger!

Panduan lengkap deployment khusus untuk **Hostinger (Business Web Hosting & VPS)** telah disediakan di file:
👉 **[`PANDUAN_HOSTINGER.md`](./PANDUAN_HOSTINGER.md)**

---

## ⚠️ Mengapa Muncul Error "Server mengembalikan status 404 / 500"?

Penyebab utama error tersebut adalah **Aplikasi ini adalah aplikasi Full-Stack (Frontend React + Backend Node.js Express)**.


Jika Anda hanya mengunggah file hasil build frontend (`dist/index.html`) ke **Static Web Hosting** (seperti cPanel HTML biasa, GitHub Pages, Netlify Static, atau Web Server tanpa runtime Node.js):
1. Browser akan mencoba memanggil API backend di endpoint `/api/fetch-folder` atau `/api/proxy-image`.
2. Karena Web Hosting static tidak memiliki server Node.js aktif untuk memproses endpoint `/api/*`, server hosting mengembalikan **halaman HTML 404 Not Found**.
3. Frontend React mencoba membaca respons JSON dari halaman 404 HTML tersebut, sehingga muncul error `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` atau `Server mengembalikan status 404 (Halaman HTML/Teks)`.

---

## 🚀 Panduan Panduan Deployment / Hosting Agar Berjalan Lancar

Aplikasi ini memerlukan **Node.js runtime** untuk menjalankan server Express backend. Berikut adalah beberapa pilihan hosting terbaik & mudah:

### Option 1: Railway / Render / Fly.io (Rekomendasi Terbaik & Gratis/Murah)

1. **Unggah Kode** ke GitHub Repository Anda.
2. **Buka [Railway.app](https://railway.app)** atau **[Render.com](https://render.com)**.
3. Buat **New Web Service** dan hubungkan dengan repositori GitHub Anda.
4. Masukkan konfigurasi berikut:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start` (atau `node dist/server.cjs`)
   - **Node Version**: 18.x / 20.x
5. Klik **Deploy**. Server akan otomatis menjalankan Express backend dan menyajikan frontend.

---

### Option 2: Hosting Menggunakan Docker / Cloud Run / VPS

Aplikasi ini sudah dilengkapi dengan `Dockerfile`.
1. **Build Docker Image**:
   ```bash
   docker build -t kandafv-photo-selector .
   ```
2. **Jalankan Container**:
   ```bash
   docker run -d -p 3000:3000 kandafv-photo-selector
   ```

---

### Option 3: VPS Ubuntu / Debian (Nginx + PM2)

1. Install Node.js v20 & PM2 di VPS:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```
2. Clone repository & install dependency:
   ```bash
   git clone <url-repo-anda>
   cd <folder-repo>
   npm install
   npm run build
   ```
3. Jalankan aplikasi dengan PM2:
   ```bash
   pm2 start dist/server.cjs --name "kandafv-app"
   pm2 save
   ```
4. Setup **Nginx Reverse Proxy** mengarah ke `http://localhost:3000`.

---

### Option 4: cPanel dengan fitur "Setup Node.js App"

Jika hosting cPanel Anda mendukung Node.js:
1. Buka **Setup Node.js App** di cPanel.
2. Buat aplikasi baru:
   - **Node.js Version**: Select 18.x / 20.x
   - **Application Root**: nama folder project
   - **Application URL**: domain/subdomain Anda
   - **Application Startup File**: `dist/server.cjs`
3. Jalankan command `npm install` dan `npm run build` melalui SSH / Terminal cPanel.
4. Klik **Restart Application**.

---

### Option 5: Deploy ke Vercel

Aplikasi ini sudah dilengkapi file konfigurasi `vercel.json`:
1. Hubungkan repository GitHub ke **Vercel**.
2. Vercel akan otomatis mengenali `server.ts` sebagai Serverless Function untuk `/api/*` dan menyajikan static bundle di `dist/`.

---

## 🛠️ Menjalankan Secara Lokal di Komputer Anda

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
3. Buka browser di `http://localhost:3000`.

---

## 🧰 Teknologi Yang Digunakan

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, JSZip
- **Backend**: Node.js, Express, Vite, Google GenAI SDK
- **Fitur Utama**:
  - Pratinjau Foto Google Drive (Public Folder & ID BATCH)
  - Penyaring & Seleksi Cepat Foto
  - Salin List Nama File Terpilih (Multi Format)
  - **Unduh Foto Terpilih / Semua Foto dalam File ZIP (JSZip)**
  - Splash Welcome Screen Eksklusif KandaFV
