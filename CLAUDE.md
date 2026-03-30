# CLAUDE.md — Airsoft Racing Project Context

## Project Overview
氣槍競速電競賽事報名平台。支援多屆賽事、隊伍報名（隊長1+隊員3+候補隊員0~2）、前台狀態查詢、後台審核管理。

## Tech Stack
- **Frontend**: Nuxt 3 + Tailwind CSS (dark esports theme, FACEIT-inspired)
- **Backend**: Nest.js + Prisma ORM
- **Database**: PostgreSQL
- **Deployment**: Zeabur (Dockerfile-based)

## Monorepo Structure
```
airsoftRacing/
├── frontend/          # Nuxt 3 (port 3000)
│   ├── pages/
│   │   ├── index.vue                        # Homepage with banner + tournament list
│   │   ├── tournament/[slug]/index.vue      # Tournament detail
│   │   ├── tournament/[slug]/register.vue   # Multi-step registration wizard
│   │   ├── tournament/[slug]/teams.vue      # Public team list (name + status only)
│   │   ├── admin/index.vue                  # Admin login
│   │   └── admin/dashboard.vue              # Admin review panel
│   ├── layouts/       # default.vue (public), admin.vue (admin panel)
│   ├── components/    # StatusBadge, AppButton
│   ├── composables/   # useApi, useCrypto (AES decrypt)
│   └── types/         # TypeScript interfaces
│
├── backend/           # Nest.js (port 3002)
│   ├── src/
│   │   ├── tournament/    # GET /api/tournaments, GET /api/tournaments/:slug
│   │   ├── registration/  # POST register, GET public teams
│   │   ├── admin/         # Login + JWT guard + team review
│   │   ├── common/        # crypto.util (AES storage), transport-crypto (AES transport)
│   │   └── prisma/        # PrismaService (global)
│   ├── prisma/
│   │   ├── schema.prisma  # Tournament → Team → Player
│   │   └── seed.ts        # Dev seed data
│   └── public/            # Static files (PDF, banner, logo)
```

## Key Design Decisions
- **National ID stored as AES-256-CBC encrypted** — reversible encryption, admin can view via transport-encrypted API
- **National ID validation**: only checks required + length (10 chars), no format/checksum verification
- **National ID no duplicate check** — same ID can register in multiple teams
- **Transport encryption**: Admin API encrypts national IDs with per-session transport key (AES-256-CBC), frontend decrypts via Web Crypto API
- **Substitutes are optional** (0-2), but if added, all fields are required
- **Public team list** returns `teamName` + `status` + player names/roles — no phone/ID exposure
- **Admin login**: single account via env vars (`ADMIN_USERNAME`, `ADMIN_PASSWORD`), JWT with 8hr expiry, includes transport key
- **Brute-force protection**: 10 failed login attempts = 15min lockout per IP
- **Rate limiting**: register 5/min, login 5/min, global 60/min
- **Banner & logo images** served from backend `/public/` directory
- **PDF rules** served from backend, URL stored in tournament `rulesPdfUrl` field
- **Payment info**: dialog with bank transfer details, LINE QR code, and captain group link

## API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/tournaments | - | List all tournaments |
| GET | /api/tournaments/:slug | - | Tournament detail + registrationStatus |
| POST | /api/tournaments/:slug/register | - | Submit registration (4-6 players) |
| GET | /api/tournaments/:slug/teams | - | Public team list (name+status only) |
| POST | /api/admin/login | - | Admin login → JWT |
| GET | /api/admin/tournaments/:slug/teams | JWT | Full team list with players |
| GET | /api/admin/teams/:id | JWT | Team detail |
| PATCH | /api/admin/teams/:id/review | JWT | Change status (PENDING/SUCCESS/FAILED) |

## Database Schema (3 tables)
- **tournament**: id, slug, name, description, rulesPdfUrl, bannerUrl, registrationOpenAt/CloseAt, isActive
- **team**: id, tournamentId, teamName, status, paymentNote, rejectionReason, submittedAt, reviewedAt
- **player**: id, teamId, tournamentId, name, phone, nationalIdHash, role, sortOrder
- Key constraints: `UNIQUE(tournamentId, teamName)`

## Local Development
```bash
# Backend (requires PostgreSQL running on localhost:5432)
cd backend
cp .env.example .env   # Edit with your DB credentials
npm install
npx prisma migrate dev
npx ts-node prisma/seed.ts
npm run start:dev       # → http://localhost:3002

# Frontend
cd frontend
npm install
npm run dev             # → http://localhost:3000
```

## Environment Variables
### Backend (.env)
- `DATABASE_URL` — PostgreSQL connection string
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — Admin credentials
- `JWT_SECRET` — JWT signing key
- `FRONTEND_URL` — CORS whitelist (comma-separated for multiple origins)
- `PORT` — Server port (default 3002)

### Frontend
- `NUXT_PUBLIC_API_BASE` — Backend API URL (default http://localhost:3002/api)

## Conventions
- Commit messages in English
- Code comments in Chinese where user-facing, English for technical
- All user-facing text in Traditional Chinese (繁體中文)
- RWD mobile-first, browser support: Chrome/Edge/Firefox 90+, Safari 14+
