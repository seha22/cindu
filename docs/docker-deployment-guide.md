# Deployment Guide dengan Docker (VPS + Supabase)

Dokumentasi ini menjelaskan langkah-langkah *end-to-end* untuk melakukan _deployment_ website/aplikasi Cinta Dhuafa (Node.js) di VPS menggunakan Docker, Nginx (domain **cintadhuafa.or.id**) dengan Database dari layanan **Supabase**.

## 1. Persiapan VPS/Server

Akses VPS Anda melalui SSH. Pastikan sistem sudah diperbarui dan aplikasi wajib telah terpasang:

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Docker & Nginx
sudo apt install docker.io docker-compose nginx certbot python3-certbot-nginx -y
```

> **Catatan (Opsional tapi Penting):** Jika VPS Anda menggunakan RAM 1GB, sangat disarankan membuat _Swap Memory_ (misal 2GB) untuk mencegah *Out of Memory* saat proses _build_ Node.js.
> ```bash
> sudo fallocate -l 2G /swapfile
> sudo chmod 600 /swapfile
> sudo mkswap /swapfile
> sudo swapon /swapfile
> echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
> ```

## 2. Setup Project & Environment

*Clone* / pindahkan _source code_ Anda ke VPS (biasanya diletakkan di `/var/www/cindu` atau `~/cinta-dhuafa`).

Masuk ke folder projek dan salin/buat file environment:

```bash
cd /jalur/ke/folder/cinta-dhuafa
cp .env.example .env
```

Buka `.env` dan masukkan informasi database Supabase Anda:
```bash
nano .env
```
Pastikan variabel `DATABASE_URL` mengarah ke *Session Pooler* atau koneksi langsung Supabase Anda:
```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
PORT=5000
```
*(Sesuaikan dengan detail database dari dashboard Supabase Anda serta environment seperti API key Midtrans).*

## 3. Proses Build & Eksekusi Kontainer

Jalankan perintah berikut untuk mem-_build_ image Node.js dan menjalankan kontainer aplikasi web di _background_:

```bash
# Build dan jalankan
sudo docker-compose up -d --build

# Cek status aplikasi
sudo docker-compose logs -f web
```
*(Tekan `Ctrl+C` untuk keluar dari logs)*

## 4. Inisialisasi Database Supabase (Opsional jika belum disetup)

Jika database Supabase Anda belum disetup strukturnya, Anda bisa menjalankan _push_ skema dari dalam container aplikasi:

```bash
# Masuk ke dalam kontainer
sudo docker exec -it cindu-web sh

# Push schema ke Supabase
npm run db:push

# Tambah akun admin default
npm run admin:create

# Keluar dari kontainer
exit
```

## 5. Setup Nginx Reverse Proxy untuk Domain

Sekarang kita akan menghubungkan domain **cintadhuafa.or.id** (yang sudah dipointing ke IP VPS) agar saat dikunjungi akan mengarah ke port 5000 Docker.

Buat file konfigurasi Nginx baru:
```bash
sudo nano /etc/nginx/sites-available/cintadhuafa
```

Isi dengan konfigurasi berikut:
```nginx
server {
    listen 80;
    server_name cintadhuafa.or.id www.cintadhuafa.or.id;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Forward true client IP
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi Nginx tersebut:
```bash
sudo ln -s /etc/nginx/sites-available/cintadhuafa /etc/nginx/sites-enabled/
```

Uji coba konfigurasi dan *Restart* Nginx:
```bash
# Pastikan tidak ada pesan error / syntax OK
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 6. Install SSL (HTTPS) dengan Certbot

Langkah terakhir, aktifkan koneksi aman HTTPS secara otomatis dengan Certbot:

```bash
sudo certbot --nginx -d cintadhuafa.or.id -d www.cintadhuafa.or.id
```

Pada proses ini, Certbot akan menanyakan email pengguna dan persetujuan. Certbot kemudian akan otomatis memodifikasi file konfigurasi Nginx Anda untuk menerapkan HTTPS _(redirect dari HTTP to HTTPS)_.

---

🎉 **Selesai!** 
Aplikasi Anda sudah berhasil dihosting di VPS Docker yang terhubung langsung ke layanan database Supabase Eksternal, dan kini aman dikunjungi di `https://cintadhuafa.or.id`.
