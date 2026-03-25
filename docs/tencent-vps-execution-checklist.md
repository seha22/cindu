# Deploy VPS Tencent untuk cintadhuafa.or.id

Checklist ini ditujukan untuk VPS Tencent rekomendasi `2 vCPU / 4 GB RAM / 60 GB` dengan Ubuntu 24.04 LTS.

## A. Persiapan di Tencent Console

1. Buat instance CVM Ubuntu 24.04 LTS.
2. Pilih region yang paling dekat dengan database dan mayoritas user. Untuk repo ini, titik paling aman adalah region Singapura karena connection string Supabase aktif mengarah ke `ap-southeast-1`.
3. Gunakan public IP tetap atau Elastic IP agar DNS tidak berubah-ubah.
4. Pasang security group yang membuka hanya port berikut:
   - `22/tcp` untuk SSH
   - `80/tcp` untuk HTTP
   - `443/tcp` untuk HTTPS
5. Jika tersedia, aktifkan auto snapshot disk sistem minimal mingguan. Ambil satu manual snapshot juga sebelum aplikasi live.
6. Buat A record untuk `cintadhuafa.or.id` dan `www.cintadhuafa.or.id` ke public IP VPS.

## B. Bootstrap server

Login SSH:

```bash
ssh ubuntu@SERVER_IP
```

Update OS dan install paket inti:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx ufw curl git
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Install Node.js 20 dan PM2:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential
sudo npm install -g pm2
node -v
npm -v
pm2 -v
```

## C. Siapkan direktori aplikasi

```bash
sudo mkdir -p /var/www/cinta-dhuafa-web/shared/uploads
sudo mkdir -p /var/www/cinta-dhuafa-web/current
sudo chown -R $USER:$USER /var/www/cinta-dhuafa-web
```

Deploy repo:

```bash
git clone <REPO_URL> /var/www/cinta-dhuafa-web/current
//git clone https://github.com/seha22/cindu.git /var/www/cinta-dhuafa-web/current
cd /var/www/cinta-dhuafa-web/current
```

## D. Siapkan environment production

Isi `.env`:

```env
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
SESSION_SECRET=isi-random-string-panjang
PORT=5000
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=Mid-server-xxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxx
ENABLE_SEED=false
```

Untuk Tencent IPv4-only, prioritaskan `Supavisor Session mode` dari Supabase.

## E. Build dan bootstrap database

```bash
cd /var/www/cinta-dhuafa-web/current
npm ci
npm run build
npm run db:test
```

Jika database baru:

```bash
npm run db:push
npm run admin:bootstrap-prod -- --username admin --email admin@cintadhuafa.or.id --password 'PASSWORD_KUAT' --full-name 'Administrator'
```

Persist uploads:

```bash
rm -rf /var/www/cinta-dhuafa-web/current/uploads
ln -s /var/www/cinta-dhuafa-web/shared/uploads /var/www/cinta-dhuafa-web/current/uploads
```

## F. Jalankan dengan PM2

```bash
cd /var/www/cinta-dhuafa-web/current
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd
pm2 status
```

## G. Pasang Nginx dan SSL

Gunakan file repo yang sudah difinalkan untuk domain produksi:

```bash
sudo cp deploy/nginx/cinta-dhuafa-web.conf /etc/nginx/sites-available/cinta-dhuafa-web
sudo ln -sfn /etc/nginx/sites-available/cinta-dhuafa-web /etc/nginx/sites-enabled/cinta-dhuafa-web
sudo nginx -t
sudo systemctl reload nginx
```

Aktifkan SSL:

```bash
sudo certbot --nginx -d cintadhuafa.or.id -d www.cintadhuafa.or.id
sudo certbot renew --dry-run
```

## H. Aktifkan backup harian

Install script backup:

```bash
cd /var/www/cinta-dhuafa-web/current
sudo install -m 750 deploy/backup/backup-daily.sh /usr/local/bin/cinta-dhuafa-backup
sudo cp deploy/backup/cinta-dhuafa-backup.cron /etc/cron.d/cinta-dhuafa-backup
sudo chmod 644 /etc/cron.d/cinta-dhuafa-backup
sudo systemctl restart cron
```

Jalankan test manual sekali:

```bash
sudo /usr/local/bin/cinta-dhuafa-backup
sudo ls -lah /var/backups/cinta-dhuafa-web/daily
```

## I. Verifikasi go-live

```bash
curl -I http://127.0.0.1:5000
curl -I https://cintadhuafa.or.id
pm2 logs cinta-dhuafa-web --lines 100
```

Checklist akhir:

- `https://cintadhuafa.or.id` terbuka
- redirect atau akses `www.cintadhuafa.or.id` normal
- login admin berhasil
- upload hero image berhasil
- donasi membuat Snap token
- webhook Midtrans di-set ke `https://cintadhuafa.or.id/api/midtrans/notification`
- backup harian menghasilkan file `.tar.gz` dan `.sha256`

## J. Operasional setelah live

Deploy update:

```bash
cd /var/www/cinta-dhuafa-web/current
git pull
npm ci
npm run build
pm2 restart cinta-dhuafa-web --update-env
```

Rotasi rutin yang disarankan:

- cek snapshot Tencent mingguan
- cek backup harian lokal setiap pagi
- copy backup ke storage terpisah agar tidak bergantung pada disk VPS yang sama
