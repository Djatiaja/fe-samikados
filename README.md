# Samikados - Frontend Seller

Bagian ini adalah panduan untuk menyiapkan dan mengembangkan frontend aplikasi **Samikados** berbasis **Vue 3** dan **Vite**, khusus untuk role **seller** (penjual) dalam platform e-commerce percetakan. Frontend ini memungkinkan penjual untuk mengelola produk, berkomunikasi dengan pelanggan, dan memproses pesanan. Proyek ini terintegrasi dengan backend Laravel untuk mendukung fungsi API.

<div align="center"><img src="./public/assets/SamikadosLogo.jpeg" width="400" alt="Samikados Logo"></div>

## Persyaratan Sistem

- **Node.js**: Versi 16 atau lebih tinggi
- **npm**: Versi terbaru
- **IDE yang Direkomendasikan**: [VSCode](https://code.visualstudio.com/) dengan ekstensi [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (nonaktifkan Vetur jika terpasang)
- **Backend**: Laravel (atau server API lain) untuk menyediakan endpoint
- **Git**: Untuk mengkloning repositori

## Pengaturan Proyek

Ikuti langkah-langkah berikut untuk menyiapkan frontend Vue.js khusus untuk role seller:

### 1. Kloning Repositori
Kloning repositori Samikados dan masuk ke direktori proyek:
```bash
git clone https://github.com/Djatiaja/fe-samikados.git
cd samikados
```

### 2. Pindah ke Branch Pengembangan
Pastikan Anda berada di branch `dev` untuk pengembangan:
```bash
git checkout dev
```

### 3. Instal Dependensi Frontend
Instal dependensi Node.js untuk frontend Vue.js:
```bash
npm install
```

### 4. Konfigurasi File `.env`
- Salin file `.env.example` menjadi `.env` di direktori root proyek:
  ```bash
  cp .env.example .env
  ```
- Sesuaikan variabel di file `.env` untuk menghubungkan frontend dengan backend Laravel. Variabel penting untuk frontend seller:
  ```
  VITE_API_BASE_URL=http://localhost:8000/api
  VITE_APP_NAME=Samikados Seller
  VITE_SELLER_DASHBOARD_PATH=/seller/dashboard
  ```
- Pastikan `VITE_API_BASE_URL` sesuai dengan URL server backend Laravel (misalnya, `http://localhost:8000` jika menjalankan `php artisan serve`).
- Hubungi pengembang untuk mendapatkan konfigurasi spesifik `.env` jika diperlukan.

### 5. Kompilasi dan Jalankan untuk Pengembangan
Jalankan server pengembangan Vite dengan fitur hot-reload:
```bash
npm run dev
```
- Server Vite biasanya berjalan di `http://localhost:5173` (periksa output terminal untuk URL pasti).
- Pastikan backend Laravel berjalan (`php artisan serve`) untuk mendukung panggilan API.
- Akses dashboard penjual di URL seperti `http://localhost:5173/seller/dashboard`.

### 6. Kompilasi dan Minimalkan untuk Produksi
Bangun aset frontend untuk produksi:
```bash
npm run build
```
- Aset yang dihasilkan akan disimpan di direktori `public/build` dan disajikan oleh Laravel.

### 7. Pemeriksaan Kode dengan ESLint
Periksa dan perbaiki masalah gaya kode pada frontend:
```bash
npm run lint
```

## Alur Kerja Pengembangan

Untuk mengembangkan frontend seller dan backend secara bersamaan:
1. Jalankan server Laravel di satu terminal:
   ```bash
   php artisan serve
   ```
2. Jalankan pekerja antrian di terminal lain:
   ```bash
   php artisan queue:work
   ```
3. Jalankan server Vite untuk frontend di terminal ketiga:
   ```bash
   npm run dev
   ```
4. Akses dashboard penjual di `http://localhost:5173` dan uji fitur seperti manajemen produk dan pesan.
