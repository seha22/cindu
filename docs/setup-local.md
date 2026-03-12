# Setup Lokal dengan Supabase

## Project Supabase
- Project URL aktif: `https://tcqqpqbrrcbbrvhqbnsz.supabase.co`
- Project ref: `tcqqpqbrrcbbrvhqbnsz`

## Pilih Connection String
Untuk backend Express seperti repo ini:
- pakai **Direct connection** jika hosting/server Anda mendukung IPv6
- pakai **Supavisor Session mode** jika hosting Anda IPv4-only
- jangan pakai **Transaction mode** untuk runtime utama Express ini

## Langkah
1. Install dependency: `npm install` atau `npm ci`
2. Buka Supabase Dashboard > `Connect`
3. Copy salah satu connection string berikut:
   - Direct connection
   - Session pooler (`method=session`)
4. Isi `.env` berdasarkan `.env.example`
5. Jika database kosong dan Anda butuh admin, buat manual: `npm run admin:create -- --username admin --email admin@example.com --password "password-kuat" --full-name "Administrator"`
6. Test koneksi database: `npm run db:test`
7. Push schema Drizzle: `npm run db:push`
8. Jika ingin isi dummy data dari CSV: `npm run db:seed:csv`
9. Jalankan app: `npm run dev`

## Catatan
- File CSV di `daftar_tabel/` dipakai sebagai sumber seed/demo, bukan source of truth schema.
- Source of truth schema tetap `shared/schema.ts`.
- Seed otomatis aktif di local selama `ENABLE_SEED=true`.
- Di production, seeding sebaiknya dimatikan.
- Jika login database gagal, verifikasi password database di Supabase dan pastikan connection string tidak salah mode.
- Password yang mengandung `@` harus di-encode menjadi `%40` di connection string.
- Admin default hardcoded sudah dihapus untuk menghindari kredensial production yang tidak aman.
- Script `db:seed:csv` sengaja skip row admin dari `users.csv`.
