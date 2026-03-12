# Supabase Setup

## Ringkasan
Repo ini cocok memakai Supabase sebagai managed Postgres, sementara backend tetap berjalan di Express dan auth tetap dikelola aplikasi.

## Project aktif
- Project URL: `https://tcqqpqbrrcbbrvhqbnsz.supabase.co`
- Project ref: `tcqqpqbrrcbbrvhqbnsz`

## Connection yang dipakai
- **Direct connection**
  - pakai jika server mendukung IPv6
  - format umum:
  - `postgresql://postgres:[PASSWORD]@db.tcqqpqbrrcbbrvhqbnsz.supabase.co:5432/postgres`
- **Supavisor Session mode**
  - pakai jika server Anda IPv4-only
  - ambil dari Supabase Dashboard > Connect > Session pooler
- **Transaction mode**
  - simpan untuk serverless/edge, bukan untuk runtime Express utama

## Workflow repo ini
1. Isi `.env`
2. Jalankan `npm run db:test`
3. Jalankan `npm run db:push`
4. Opsional: `npm run db:seed:csv`
5. Jalankan `npm run dev`

## Catatan penting
- `DATABASE_URL` adalah satu-satunya yang wajib untuk Drizzle/Postgres.
- `SESSION_SECRET` wajib di production.
- `ENABLE_SEED=false` untuk production.
- Bila Anda deploy ke Niagahoster Node hosting dan koneksi direct gagal, fallback pertama adalah Session pooler Supabase.
- Password yang mengandung `@` harus di-encode menjadi `%40` di connection string.
