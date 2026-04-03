# Deployment Guide dengan Docker (VPS + Supabase)

Dokumentasi ini menjelaskan langkah-langkah *end-to-end* untuk melakukan _deployment_ website/aplikasi Cinta Dhuafa (Node.js) di VPS menggunakan Docker, Nginx (domain **cintadhuafa.or.id**) dengan Database dari layanan **Supabase**.

## 1. Persiapan VPS/Server

Akses VPS Anda melalui SSH. Pastikan sistem sudah diperbarui dan aplikasi wajib telah terpasang:

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Docker versi modern (docker-compose-plugin) & Nginx
sudo apt install docker.io docker-compose-plugin nginx certbot python3-certbot-nginx -y

# Buka akses Firewall Ubuntu untuk Nginx
sudo ufw allow 'Nginx Full'
```

> **PENTING (Tencent/AWS Cloud):** Pastikan pada halaman *Security Group / Firewall* di panel kontrol VPS Anda, *Port 80 (HTTP)* dan *Port 443 (HTTPS)* sudah dalam keadaan terbuka (Allowed).
>
> **Catatan (Opsional tapi Penting):** Jika VPS Anda menggunakan RAM 1GB, sangat disarankan membuat _Swap Memory_ (misal 2GB) untuk mencegah *Out of Memory* saat proses _build_.
> ```bash
> sudo fallocate -l 2G /swapfile
> sudo chmod 600 /swapfile
> sudo mkswap /swapfile
> sudo swapon /swapfile
> echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
> ```

## 2. Setup Project & Environment

*Clone* / pindahkan _source code_ Anda ke VPS (biasanya diletakkan di `/var/www/cintu` atau `~/cindu`).

Masuk ke folder projek dan salin/buat file environment:

```bash
cd ~/cindu
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

## 3. Proses Build & Eksekusi Kontainer

Gunakan perintah `docker compose` (dengan spasi, bukan strip/dash agar terhindar dari *bug ContainerConfig* versi usang).

```bash
# Build dan jalankan
sudo docker compose up -d --build

# Cek status aplikasi, pastikan tulisan tidak ada pesan error / restart
sudo docker logs -f cindu-web
```
*(Tekan `Ctrl+C` untuk keluar dari logs)*

## 4. Inisialisasi Database Supabase (Opsional)

Jika database Anda masih baru/kosong, aplikasikan skema tabel dari dalam kontainer:

```bash
# Push schema tabel otomatis ke database
sudo docker exec -it cindu-web npm run db:push

# Tambah akun admin default
sudo docker exec -it cindu-web npm run admin:create
```

## 5. Setup Nginx Reverse Proxy untuk Domain

Buat file konfigurasi Nginx baru:
```bash
sudo nano /etc/nginx/sites-available/cintadhuafa
```

Isi dengan konfigurasi berikut **(Pastikan copy-paste dari huruf awal `server {`)**:
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

Aktifkan konfigurasi pengaturan tersebut dan *restart* Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/cintadhuafa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Install SSL (HTTPS) dengan Certbot

Langkah terakhir adalah mengaktifkan sertifikat HTTPS.
**PERHATIAN KHUSUS JIKA MENGGUNAKAN CLOUDFLARE DNS:**
1. Pastikan Anda sudah membuat **A Record** untuk `cintadhuafa.or.id` dan **CNAME Record** untuk `www` di Cloudflare.
2. **Matikan sementara fitur Proxy** (Awan berwarna abu-abu / *DNS Only*) saat eksekusi Certbot di bawah.

Jalankan instalasi SSL:
```bash
sudo certbot --nginx -d cintadhuafa.or.id -d www.cintadhuafa.or.id
```

Setelah tampil tulisan *Congratulations!*, segera kembali ke panel Cloudflare:
- Ubah kembali *Proxy status* awan menjadi **Oranye (Proxied)**.
- Buka menu **SSL/TLS -> Overview**, dan ubah pengaturan ke mode **Full (strict)** agar lalu lintas terenkripsi sempurna.

---

## 7. Prosedur Update Code (Deployment Pembaruan)
Jika suatu saat terdapat pembaharuan (*update*) pada *source code* (contohnya perbaikan bug di GitHub), ikuti proses pembaruan berikut pada VPS Anda:

1. **Masuk ke direktori web**
   ```bash
   cd ~/cindu
   ```

2. **Ambil pembaruan terbaru dari GitHub**
   ```bash
   git pull origin main
   ```

3. **Re-build kontainer Docker**
   Proses ini berlangsung secara otomatis membuat ulang (*recreate*) kontainer tanpa *downtime* yang sangat lama. Tanpa perlu `--build` karena docker akan mendeteksinya. Atau amannya:
   ```bash
   sudo docker compose up -d --build
   ```

4. **Kirim pembaruan skema database (Opsional)**
   Hanya lakukan ini jika ada instruksi dari tim *developer* bahwa versi terbaru memiliki perubahan pada stuktur database (*schema update*):
   ```bash
   sudo docker exec -it cindu-web npm run db:push
   ```

---
🎉 **Selesai!** 
Aplikasi Anda dan sistem *Update* rutinnya kini terintegrasi secara praktis dalam sistem *containerized* (Docker) di server produksi / VPS Anda.
