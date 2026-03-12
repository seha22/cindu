# Deploy Checklist

## Rekomendasi Hosting
Untuk codebase ini, gunakan hosting Node/VPS terlebih dulu. Arsitektur sekarang adalah monolith Express + Vite + PostgreSQL + session-based auth, jadi lebih cocok untuk server yang always-on daripada Vercel serverless.

## Database: Supabase Postgres
- Project URL aktif: `https://tcqqpqbrrcbbrvhqbnsz.supabase.co`
- Untuk runtime Express production:
  - pilih **Direct connection** jika server Anda mendukung IPv6
  - pilih **Supavisor Session mode** jika server Anda IPv4-only
- Hindari **Transaction mode** sebagai `DATABASE_URL` utama untuk app ini

## Checklist
1. Sediakan password database Supabase yang tersimpan aman.
2. Isi environment variables production:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `PORT`
   - `MIDTRANS_IS_PRODUCTION=true`
   - `MIDTRANS_SERVER_KEY`
   - `MIDTRANS_CLIENT_KEY`
   - `ENABLE_SEED=false`
3. Jika database production kosong, bootstrap admin dengan `npm run admin:create -- --username ... --email ... --password ... --full-name ...`
4. Pastikan app berjalan di HTTPS dan reverse proxy meneruskan header dengan benar.
5. Build aplikasi: `npm run build`
6. Start aplikasi: `npm run start`
7. Jalankan verifikasi DB sebelum deploy final: `npm run db:test`
8. Push schema jika DB masih kosong: `npm run db:push`
9. Jika perlu data demo awal: `npm run db:seed:csv`
10. Set webhook Midtrans ke endpoint `/api/midtrans/notification`
11. Jangan commit secret ke `.replit`, `.env`, atau file repo lain.
12. Review cookie/session setelah deploy untuk memastikan login berjalan di domain final.
