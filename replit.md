# Cinta Dhuafa - Yayasan Peduli Umat

## Overview
Website for Yayasan Cinta Dhuafa, a charity foundation focused on helping underprivileged communities. Built with React + Express + PostgreSQL.

## Architecture
- **Frontend**: React with wouter routing, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with PostgreSQL via Drizzle ORM
- **Database**: PostgreSQL with tables: programs, donations, articles

## Pages
- **Beranda** (`/`) - Landing page with hero, stats, featured programs
- **Program Amal** (`/programs`) - List of charity programs with donation dialog
- **Detail Program** (`/programs/:id`) - Full program detail with description, donation sidebar, preset amounts, and donor list with prayers
- **Artikel** (`/articles`) - Articles & news with detail view
- **Tentang Kami** (dropdown menu with sub-pages):
  - **Sejarah** (`/about/sejarah`) - Foundation history timeline
  - **Visi & Misi** (`/about/visi-misi`) - Vision and mission statements
  - **Struktur Organisasi** (`/about/struktur-organisasi`) - Organizational structure with member cards
  - **Program** (`/about/program`) - Program areas overview (Pendidikan, Kesehatan, Ekonomi, Sosial)

## Key Files
- `shared/schema.ts` - Database schema (programs, donations, articles)
- `shared/routes.ts` - API contract definitions
- `server/routes.ts` - Express API routes + seed data
- `server/storage.ts` - Database storage layer
- `client/src/pages/` - React page components
- `client/src/pages/about/` - About us sub-pages (Sejarah, VisiMisi, StrukturOrganisasi, ProgramKami)
- `client/src/components/layout/` - Navbar, Footer
- `client/src/components/programs/` - ProgramCard, DonationDialog
- `client/src/hooks/` - Custom hooks for data fetching

## Theme
- Primary: Teal (#0f766e)
- Accent: Amber (#f59e0b)
- Fonts: Outfit (display), Plus Jakarta Sans (body)

## API Endpoints
- `GET /api/programs` - List all programs
- `GET /api/programs/:id` - Get single program (includes content field)
- `POST /api/programs` - Create program
- `GET /api/programs/:id/donations` - List donations for a specific program
- `GET /api/donations` - List all donations
- `POST /api/donations` - Create donation
- `GET /api/articles` - List all articles
- `GET /api/articles/:id` - Get single article
