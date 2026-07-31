# 🚀 Panduan Lengkap Install KandaFV di Hostinger (Business Web Hosting & VPS)

Aplikasi **KandaFV Google Drive Photo Selector** ini adalah aplikasi **Full-Stack (Frontend React + Backend Node.js Express)**. 

agar fitur **Copy & Paste Link Google Drive, Preview Foto, dan Unduh ZIP** berfungsi dengan lancar, **Server Backend Node.js HARUS berjalan aktif**.

---

## 📌 Mengapa Tidak Bisa Hanya Upload File HTML di `public_html`?

Jika Anda hanya mengunggah file `dist/index.html` ke hosting HTML biasa tanpa mengaktifkan Node.js:
- Panggilan API ke `/api/fetch-folder`, `/api/proxy-image`, dan `/api/ai-extract` akan menghasilkan **Error 404 / 500**.
- Fitur mengambil foto dari link Google Drive **TIDAK AKAN BEKERJA**.

---

## 📦 Metode 1: Hostinger Business Web Hosting (via Node.js Selector / App Manager)

Hostinger Business Web Hosting mendukung **Node.js Web App** secara langsung melalui hPanel.

### Langkah 1: Persiapan Project di Komputer / AI Studio
1. Download ZIP project ini dari AI Studio (**Settings > Export / Download ZIP**).
2. Ekstrak ZIP di komputer Anda.
3. Buka Terminal / Command Prompt di folder project, lalu jalankan:
   ```bash
   npm install
   npm run build
   ```
   *(Command `npm run build` akan menghasilkan folder `dist/` dan file `dist/server.cjs` yang siap digunakan untuk produksi)*.

### Langkah 2: Mengunggah File ke Hostinger hPanel
1. Login ke **hPanel Hostinger** (`hpanel.hostinger.com`).
2. Masuk ke menu **File Manager** pada domain/subdomain Anda.
3. Unggah seluruh file project termasuk:
   - Folder `dist/`
   - `package.json`
   - `ecosystem.config.cjs`
   - `.htaccess`
   - `.env.example` (atau buat `.env` baru)
   *(Folder `node_modules` tidak perlu diunggah agar proses upload cepat)*.

### Langkah 3: Membuat & Mengaktifkan Aplikasi Node.js di hPanel
1. Di hPanel Hostinger, cari menu **Node.js** (atau **Setup Node.js App**).
2. Klik **Create Application** dan isi konfigurasi berikut:
   - **Node.js Version**: Pilih **18.x** atau **20.x**
   - **Application Mode**: Production
   - **Application Root**: `public_html` (atau folder tempat Anda menyimpan file project)
   - **Application URL**: Pilih domain atau subdomain Anda
   - **Application Startup File**: `dist/server.cjs`
3. Simpan / Klik **Create**.
4. Gulir ke bawah ke bagian **Command** atau **Terminal hPanel**, lalu jalankan:
   ```bash
   npm install --production
   ```
5. Di bagian **Environment Variables**, tambahkan:
   - `GEMINI_API_KEY`: *(Masukkan API key Gemini Anda jika menggunakan AI)*
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (atau port default yang diberikan Hostinger)
6. Klik **Restart Application**.

---

## 🖥️ Metode 2: Hostinger VPS (Ubuntu / Debian - Nginx + PM2)

Jika Anda menggunakan **Hostinger VPS**, ini adalah metode terbaik & paling efisien.

### Langkah 1: Install Node.js & PM2 di VPS
Jalankan perintah berikut melalui SSH di VPS Hostinger Anda:
```bash
# Update package list & install Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

# Install PM2 Process Manager secara global
sudo npm install -g pm2
```

### Langkah 2: Upload & Build Application
1. Clone / upload project Anda ke folder `/var/www/kandafv`.
2. Masuk ke direktori project:
   ```bash
   cd /var/www/kandafv
   npm install
   npm run build
   ```

### Langkah 3: Jalankan Server dengan PM2
Jalankan aplikasi menggunakan konfigurasi PM2 yang sudah disediakan:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Langkah 4: Setup Nginx Reverse Proxy
Edit konfigurasi Nginx di VPS (`/etc/nginx/sites-available/default` atau domain config):
```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Lalu restart Nginx:
```bash
sudo systemctl restart nginx
```

---

## 🛠️ Checklist Pengujian Setelah Deployment

1. **Buka Domain Anda di Browser**: Pastikan halaman utama KandaFV terbuka.
2. **Uji Paste Link Google Drive**:
   - Salin link folder Google Drive publik atau link file individu.
   - Tempel ke dalam kolom input KandaFV dan klik **Proses**.
   - Pastikan foto-foto muncul dalam grid pratinjau.
3. **Uji Fitur Unduh ZIP**:
   - Pilih beberapa foto.
   - Klik **Unduh ZIP Terpilih**.
   - Pastikan file ZIP terunduh ke komputer Anda.

---

## ❓ Kendala Umum & Solusinya

- **Problem: Error 404 / 500 saat memproses link Google Drive.**
  - **Penyebab**: Server Express Node.js belum berjalan / mati.
  - **Solusi**: Pastikan di hPanel Hostinger status Node.js App adalah **RUNNING**, atau di VPS jalankan `pm2 status` untuk memastikan `kandafv-photo-selector` dalam status `online`.

- **Problem: Link Google Drive privat / butuh izin akses.**
  - **Penyebab**: Folder Google Drive belum diatur menjadi Publik.
  - **Solusi**: Di Google Drive, klik kanan folder > **Bagikan (Share)** > ubah Akses Umum menjadi **"Siapa saja yang memiliki link" (Anyone with the link)**.

- **Problem: Deployment failed - missing critical configuration files: package.json is null/empty.**
  - **Penyebab**: File `package.json` tidak berada di root folder lokasi deployment (misalnya file terekstrak ke dalam subfolder seperti `kandafv-main/package.json` atau tidak ikut terunggah ke Hostinger File Manager/Git).
  - **Solusi**:
    1. Pastikan seluruh isi project (termasuk `package.json`, `vite.config.ts`, `server.ts`, folder `src/`) berada langsung di root **`public_html`** (atau root Application Folder Node.js Anda), **bukan** di dalam folder bersarang (subfolder).
    2. Pastikan file `package.json` yang diunggah valid dan memiliki struktur dependencies lengkap (sudah kami perbarui dengan nama `kandafv-photo-selector`).
    3. Jika Anda menggunakan fitur **Hostinger Web Hosting (Node.js App Manager)**: Masuk ke **Node.js** di hPanel -> atur **Application Root** tepat ke lokasi `package.json` berada -> jalankan `npm install`.
    4. Jika Anda hanya ingin deploy static HTML (tanpa backend proxy): Anda dapat melakukan `npm run build` di lokal komputer Anda terlebih dahulu, lalu upload isi folder `dist/` ke `public_html`. (Catatan: Untuk fitur pratinjau & download foto Google Drive, disarankan menggunakan metode Node.js App / VPS).

- **Problem: Gambar thumbnail tidak muncul (broken image).**
  - **Solusi**: Endpoint `/api/proxy-image` membutuhkan akses internet dari server ke Google Drive. Pastikan server Hostinger Anda tidak memblokir outgoing HTTPS request ke `drive.google.com` & `googleusercontent.com`.

- **Problem: Error GLIBC / Rollup incompatibility (`@rollup/rollup-linux-x64-gnu` requires GLIBC 2.29).**
  - **Penyebab**: Server hosting memiliki versi sistem GLIBC yang lebih lama dibanding binary Rollup native default.
  - **Solusi**:
    1. Hapus file `package-lock.json` dan folder `node_modules`.
    2. Jalankan `npm install` ulang di server/VPS agar npm mengunduh binary yang sesuai dengan environment hosting Anda.
    3. File `.npmrc` telah ditambahkan dengan `build-from-source=false` serta `package.json` yang dikonfigurasi dengan `optionalDependencies` (`@rollup/rollup-linux-x64-musl` & `@rollup/rollup-linux-x64-gnu`) untuk mendukung lingkungan musl dan glibc secara otomatis.
