# Deploy VPS Ubuntu 24.04

Panduan ini diasumsikan untuk VPS Tencent rekomendasi `2 vCPU / 4 GB RAM / 60 GB` dengan Ubuntu Server 24.04 LTS, Nginx sebagai reverse proxy, PM2 sebagai process manager, dan app berjalan di port `5000` untuk domain `cintadhuafa.or.id` dan `www.cintadhuafa.or.id`.

## Arsitektur deploy

- Nginx menerima trafik publik pada port `80/443`
- PM2 menjalankan satu proses Node untuk app ini
- App tetap memakai Supabase Postgres sebagai database utama
- File upload tetap disimpan di folder lokal `uploads/`, jadi siapkan backup terpisah jika konten penting

## 1. Siapkan server

Login sebagai user dengan sudo, lalu update package:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx ufw curl git
```

Buka firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 2. Install Node.js 20 LTS dan PM2

Gunakan Node 20 LTS agar stabil untuk runtime Express + Vite build repo ini.

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential
sudo npm install -g pm2
node -v
npm -v
```

## 3. Siapkan direktori aplikasi

Contoh layout deploy:

```text
/var/www/cinta-dhuafa-web
  current
  shared
```

Buat folder:

```bash
sudo mkdir -p /var/www/cinta-dhuafa-web/shared/uploads
sudo mkdir -p /var/www/cinta-dhuafa-web/current
sudo chown -R $USER:$USER /var/www/cinta-dhuafa-web
```

Clone repo:

```bash
git clone <REPO_URL> /var/www/cinta-dhuafa-web/current
cd /var/www/cinta-dhuafa-web/current
```

## 4. Isi environment production

Buat file `.env` di server pada folder app:

```env
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
SESSION_SECRET=ganti-dengan-random-string-panjang
PORT=5000
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=Mid-server-xxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxx
ENABLE_SEED=false
```

Catatan:

- Gunakan `Supavisor Session mode` jika VPS Anda IPv4-only
- Gunakan `Direct connection` jika VPS mendukung IPv6 dan koneksi stabil
- Jangan simpan secret di repo
- `script/start.cjs` sudah otomatis membaca `.env` saat aplikasi start

## 5. Install dependency dan build app

Jalankan:

```bash
cd /var/www/cinta-dhuafa-web/current
npm ci
npm run build
npm run db:test
```

Jika database production masih kosong:

```bash
npm run db:push
npm run admin:bootstrap-prod -- --username admin --email admin@cintadhuafa.or.id --password 'PASSWORD_KUAT' --full-name 'Administrator'
```

Jika script `admin:bootstrap-prod` tidak dipakai, gunakan `npm run admin:create`.

## 6. Persist folder uploads

Karena app menyimpan file ke `uploads/`, arahkan folder itu ke shared storage agar tidak hilang saat redeploy.

```bash
rm -rf /var/www/cinta-dhuafa-web/current/uploads
ln -s /var/www/cinta-dhuafa-web/shared/uploads /var/www/cinta-dhuafa-web/current/uploads
```

## 7. Jalankan dengan PM2

Repo ini sudah menyertakan [`ecosystem.config.cjs`](../ecosystem.config.cjs). Ubah `cwd` di file itu bila path deploy Anda berbeda dari `/var/www/cinta-dhuafa-web/current`.

Start aplikasi:

```bash
cd /var/www/cinta-dhuafa-web/current
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd
```

Cek status:

```bash
pm2 status
pm2 logs cinta-dhuafa-web
```

## 8. Konfigurasi Nginx

Repo ini menyertakan template final [`deploy/nginx/cinta-dhuafa-web.conf`](../deploy/nginx/cinta-dhuafa-web.conf) untuk `cintadhuafa.or.id` dan `www.cintadhuafa.or.id`.

Pasang config:

```bash
sudo cp deploy/nginx/cinta-dhuafa-web.conf /etc/nginx/sites-available/cinta-dhuafa-web
sudo ln -sfn /etc/nginx/sites-available/cinta-dhuafa-web /etc/nginx/sites-enabled/cinta-dhuafa-web
sudo nginx -t
sudo systemctl reload nginx
```

Sebelum SSL aktif, pastikan domain sudah resolve ke IP VPS dan aplikasi bisa diakses dari HTTP.

## 9. Aktifkan SSL dengan Certbot

Setelah DNS mengarah ke VPS:

```bash
sudo certbot --nginx -d cintadhuafa.or.id -d www.cintadhuafa.or.id
```

Verifikasi auto-renew:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

## 10. Midtrans dan verifikasi akhir

Set webhook Midtrans ke:

```text
https://cintadhuafa.or.id/api/midtrans/notification
```

Lalu verifikasi:

```bash
curl -I http://127.0.0.1:5000
curl -I https://cintadhuafa.or.id
pm2 logs cinta-dhuafa-web --lines 100
```

Checklist akhir:

- Login admin berhasil
- Upload hero image berhasil
- Donasi membuat Snap token
- Webhook Midtrans masuk tanpa error
- Session tetap valid setelah login lewat HTTPS

## Operasional harian

Deploy update:

```bash
cd /var/www/cinta-dhuafa-web/current
git pull
npm ci
npm run build
pm2 restart cinta-dhuafa-web --update-env
```

Perintah yang paling sering dipakai:

```bash
pm2 status
pm2 logs cinta-dhuafa-web
pm2 restart cinta-dhuafa-web --update-env
sudo systemctl reload nginx
sudo nginx -t
```
