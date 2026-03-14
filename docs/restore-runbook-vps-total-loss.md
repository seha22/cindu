# Restore Runbook: VPS Mati Total

Runbook ini diasumsikan untuk skenario VPS Tencent hilang total atau tidak bisa dipulihkan, tetapi source code tetap ada di Git dan database utama tetap dikelola di Supabase.

## Target recovery

- Domain utama: `cintadhuafa.or.id`
- Domain www: `www.cintadhuafa.or.id`
- App root: `/var/www/cinta-dhuafa-web/current`
- Shared uploads: `/var/www/cinta-dhuafa-web/shared/uploads`
- Nginx site: `/etc/nginx/sites-available/cinta-dhuafa-web`
- PM2 app name: `cinta-dhuafa-web`

## 1. Provision server baru

1. Buat CVM baru di Tencent dengan Ubuntu 24.04 LTS.
2. Pasang security group yang membuka port `22`, `80`, dan `443`.
3. Arahkan Elastic IP atau update A record `cintadhuafa.or.id` dan `www.cintadhuafa.or.id` ke IP baru.
4. Login ke server baru sebagai user sudo.

## 2. Install komponen dasar

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx ufw curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential
sudo npm install -g pm2
```

## 3. Siapkan direktori deploy

```bash
sudo mkdir -p /var/www/cinta-dhuafa-web/shared/uploads
sudo mkdir -p /var/www/cinta-dhuafa-web/current
sudo chown -R $USER:$USER /var/www/cinta-dhuafa-web
```

## 4. Restore source code

```bash
git clone <REPO_URL> /var/www/cinta-dhuafa-web/current
cd /var/www/cinta-dhuafa-web/current
```

Checkout ke tag atau commit production terakhir jika diperlukan.

## 5. Restore backup aplikasi

Ambil file backup terakhir ke server baru, misalnya:

```bash
scp latest-backup.tar.gz user@SERVER:/tmp/cintadhuafa-backup.tar.gz
scp latest-backup.tar.gz.sha256 user@SERVER:/tmp/cintadhuafa-backup.tar.gz.sha256
cd /tmp
sha256sum -c cintadhuafa-backup.tar.gz.sha256
```

Extract backup:

```bash
mkdir -p /tmp/cintadhuafa-restore
tar -xzf /tmp/cintadhuafa-backup.tar.gz -C /tmp/cintadhuafa-restore
```

Restore file konfigurasi dan uploads:

```bash
cp /tmp/cintadhuafa-restore/config/.env /var/www/cinta-dhuafa-web/current/.env
sudo cp /tmp/cintadhuafa-restore/config/nginx-cinta-dhuafa-web.conf /etc/nginx/sites-available/cinta-dhuafa-web
rm -rf /var/www/cinta-dhuafa-web/shared/uploads
mv /tmp/cintadhuafa-restore/app/uploads /var/www/cinta-dhuafa-web/shared/uploads
ln -sfn /var/www/cinta-dhuafa-web/shared/uploads /var/www/cinta-dhuafa-web/current/uploads
```

## 6. Restore database bila dibutuhkan

Dalam banyak kasus, database Supabase tidak perlu direstore karena terpisah dari VPS. Jika masalah juga menyentuh data database, restore dari backup Supabase atau dari logical dump terbaru sebelum app diaktifkan.

Sesudah itu verifikasi koneksi:

```bash
cd /var/www/cinta-dhuafa-web/current
npm ci
npm run db:test
```

## 7. Build dan start aplikasi

```bash
cd /var/www/cinta-dhuafa-web/current
npm ci
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd
```

## 8. Aktifkan Nginx dan SSL

```bash
sudo ln -sfn /etc/nginx/sites-available/cinta-dhuafa-web /etc/nginx/sites-enabled/cinta-dhuafa-web
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d cintadhuafa.or.id -d www.cintadhuafa.or.id
```

Jika DNS belum propagate, tunda langkah Certbot sampai domain resolve ke IP baru.

## 9. Verifikasi pasca-restore

```bash
curl -I http://127.0.0.1:5000
curl -I https://cintadhuafa.or.id
pm2 status
pm2 logs cinta-dhuafa-web --lines 100
```

Checklist verifikasi:

- Homepage terbuka
- Login admin berhasil
- Hero image lama tampil
- Buat donasi baru berhasil
- Midtrans webhook mengarah ke `https://cintadhuafa.or.id/api/midtrans/notification`
- Session login tetap stabil di HTTPS

## 10. Aktifkan lagi backup harian

```bash
sudo install -m 750 deploy/backup/backup-daily.sh /usr/local/bin/cinta-dhuafa-backup
sudo cp deploy/backup/cinta-dhuafa-backup.cron /etc/cron.d/cinta-dhuafa-backup
sudo chmod 644 /etc/cron.d/cinta-dhuafa-backup
sudo systemctl restart cron
```
