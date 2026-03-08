# Cinta Dhuafa - Yayasan Peduli Umat

## Overview
Website for Yayasan Cinta Dhuafa, a charity foundation focused on helping underprivileged communities. Built with React + Express + PostgreSQL. Features two user roles (Admin and Orang Tua Asuh), a CMS for managing content, and Midtrans Snap integration for donations.

## Architecture
- **Frontend**: React with wouter routing, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with PostgreSQL via Drizzle ORM
- **Auth**: Passport.js local strategy with express-session (connect-pg-simple for session store), bcryptjs for password hashing
- **Payments**: Midtrans Snap (sandbox mode) for donation processing
- **Database**: PostgreSQL with tables: users, programs, donations, articles, cms_pages, session

## User Roles
- **Admin** (role: `admin`): Manages CMS content (articles, programs, CMS pages), views donations. Default admin: username=`admin`, password=`admin123`
- **Orang Tua Asuh** (role: `orang_tua_asuh`): Foster parent with dashboard, profile management, and donation history
- **Anonymous**: Non-authenticated users can browse and donate directly

## Pages

### Public Pages
- **Beranda** (`/`) - Landing page with hero, stats, featured programs
- **Program Amal** (`/programs`) - List of charity programs with donation dialog
- **Detail Program** (`/programs/:id`) - Full program detail with donation sidebar and Midtrans payment
- **Artikel** (`/articles`) - Articles & news with detail view
- **Tentang Kami** (dropdown with sub-pages, content fetched from CMS API):
  - **Sejarah** (`/about/sejarah`) - Foundation history timeline
  - **Visi & Misi** (`/about/visi-misi`) - Vision and mission statements
  - **Struktur Organisasi** (`/about/struktur-organisasi`) - Organizational structure
  - **Program** (`/about/program`) - Program areas overview

### Auth Pages
- **Login** (`/login`) - Login form for both roles
- **Register** (`/register`) - Registration for orang tua asuh

### Admin Dashboard (`/admin/*`)
- **Dashboard** (`/admin`) - Stats overview (total donations, programs, articles, donors)
- **Programs** (`/admin/programs`) - CRUD management for donation programs
- **Articles** (`/admin/articles`) - CRUD management for articles
- **Donations** (`/admin/donations`) - View all donations with statuses
- **Orang Tua Asuh** (`/admin/users`) - List foster parents with donation stats and detail view
- **Laporan** (`/admin/reports`) - Reports & analytics (donation per program, monthly stats, top donors)
- **CMS** (`/admin/cms`) - Edit CMS pages (sejarah, visi-misi, struktur-organisasi, program)

### Foster Parent Dashboard (`/dashboard/*`)
- **Dashboard** (`/dashboard`) - Personal donation summary and recent donations
- **Profile** (`/dashboard/profile`) - Edit profile information
- **Donation History** (`/dashboard/riwayat-donasi`) - Full donation history with payment statuses

## Key Files
- `shared/schema.ts` - Database schema (users, programs, donations, articles, cmsPages) with insert schemas and types
- `server/routes.ts` - All Express API routes (auth, programs, articles, donations, CMS, admin stats)
- `server/auth.ts` - Passport.js setup, session config, requireAuth/requireAdmin middleware
- `server/midtrans.ts` - Midtrans Snap transaction creation helper
- `server/storage.ts` - Full database storage interface (IStorage) and DatabaseStorage implementation
- `client/src/hooks/use-auth.tsx` - Auth context provider with login/register/logout/user state
- `client/src/App.tsx` - All routes with protected route wrappers (AdminRoute, UserRoute, GuestRoute)
- `client/src/pages/admin/` - Admin dashboard pages (AdminLayout, AdminDashboard, AdminPrograms, AdminArticles, AdminDonations, AdminUsers, AdminReports, AdminCms)
- `client/src/pages/dashboard/` - Foster parent dashboard pages (DashboardLayout, Dashboard, Profile, DonationHistory)
- `client/src/pages/about/` - About us sub-pages (Sejarah, VisiMisi, StrukturOrganisasi, ProgramKami)
- `client/src/components/layout/` - Navbar, Footer
- `client/src/components/programs/` - ProgramCard, DonationDialog (with Midtrans Snap)

## Theme
- Primary: Teal (#0f766e)
- Accent: Amber (#f59e0b)
- Fonts: Outfit (display), Plus Jakarta Sans (body)

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new orang tua asuh
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Programs
- `GET /api/programs` - List all programs
- `GET /api/programs/:id` - Get single program
- `POST /api/programs` - Create program (admin)
- `PUT /api/programs/:id` - Update program (admin)
- `DELETE /api/programs/:id` - Delete program (admin)
- `GET /api/programs/:id/donations` - List donations for program

### Articles
- `GET /api/articles` - List all articles
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create article (admin)
- `PUT /api/articles/:id` - Update article (admin)
- `DELETE /api/articles/:id` - Delete article (admin)

### Donations
- `GET /api/donations` - List all donations (admin)
- `POST /api/donations` - Create donation
- `POST /api/donations/create-payment` - Create Midtrans payment and get Snap token
- `GET /api/user/donations` - Get current user's donations

### CMS
- `GET /api/cms/:slug` - Get CMS page content (public)
- `PUT /api/cms/:slug` - Update CMS page content (admin)

### Admin
- `GET /api/admin/stats` - Dashboard statistics (admin)
- `GET /api/admin/users` - List orang tua asuh users with donation stats (admin)
- `GET /api/admin/users/:id/donations` - Get specific user's donation history (admin)
- `GET /api/admin/reports` - Full reports data: program stats, monthly stats, top donors (admin)

### Midtrans
- `POST /api/midtrans/notification` - Midtrans webhook handler

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - Express session secret (defaults to fallback)
- `MIDTRANS_SERVER_KEY` - Midtrans server key (sandbox)
- `MIDTRANS_CLIENT_KEY` - Midtrans client key (sandbox)

## Donation Flow
1. User fills donation form (amount, name, email, message/prayer)
2. Frontend calls `POST /api/donations/create-payment` → creates donation record (status: pending) + Midtrans Snap token
3. Midtrans Snap popup opens for payment
4. On payment completion, Midtrans sends webhook to `POST /api/midtrans/notification`
5. Webhook updates donation status (settlement/failed) and program currentAmount

## CMS Content Format
CMS pages store content as JSON string in `cms_pages.content`:
- `sejarah`: `{ intro, timeline: [{ year, title, description }] }`
- `visi-misi`: `{ visi, misi: [string] }`
- `struktur-organisasi`: `{ description, members: [{ name, position }] }`
- `program`: `{ intro, areas: [{ title, description, icon }] }`
