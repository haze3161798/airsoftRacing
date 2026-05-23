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
│   │   ├── index.vue                        # Homepage + tournament list (sorted: 職業組置頂)
│   │   ├── tournament/[slug]/*              # Dynamic fallback route (now unused; reserved)
│   │   ├── tournament/season-1/             # 職業組獨立頁面 (slug 硬寫；費用 4,500)
│   │   │   ├── index.vue                    #   - 賽事詳情、繳費 Dialog
│   │   │   ├── register.vue                 #   - 多步驟報名 wizard
│   │   │   └── teams.vue                    #   - 公開隊伍列表
│   │   ├── tournament/season-1-fun/         # 娛樂組獨立頁面 (slug 硬寫；費用 2,500)
│   │   │   ├── index.vue
│   │   │   ├── register.vue
│   │   │   └── teams.vue
│   │   ├── admin/index.vue                  # Admin login
│   │   └── admin/dashboard.vue              # Admin review panel (tournament selector 自動列出)
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
- **多組賽事 UI**：職業組（`season-1`）與娛樂組（`season-1-fun`）採「暴力複製 Vue 檔」方式做成獨立兩頁，**不抽共用元件**（PO 偏好 simple over DRY for one-off event sites）
- **Header 下拉選單**：立即報名 / 查看報名隊伍 / 下載 PDF 三個項目各自 hover 展開顯示兩組
- **Data migration**：新賽事透過 `prisma/migrations/*/migration.sql` 寫 INSERT...ON CONFLICT DO NOTHING，部署時 `prisma migrate deploy` 自動執行
- **HTTP cache control**（[nuxt.config.ts](frontend/nuxt.config.ts)）：HTML 路徑 `no-cache` 強制重新驗證、`/_nuxt/*` immutable 長快取，避免 Safari 用 heuristic 快取殘留舊版

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

## Database Schema (5 tables)
- **tournament**: id, slug, name, description, rulesPdfUrl, bannerUrl, registrationOpenAt/CloseAt, isActive
  - Current rows: `season-1`（職業組）、`season-1-fun`（娛樂組），both `isActive: true`
- **team**: id, tournamentId, teamName, status, paymentNote, rejectionReason, submittedAt, reviewedAt
- **player**: id, teamId, tournamentId, name, phone, nationalIdHash, role, sortOrder
- **sponsor**: id, name, imageData (bytea), imageMimeType, linkUrl, isActive, sortOrder
- **prize_tag** / **prize**: 獎品標籤與獎品（圖片存 bytea）
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
