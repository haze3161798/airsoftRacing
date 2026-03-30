# Airsoft Racing — 氣槍競速電競賽事報名平台

多屆賽事報名系統，提供隊伍報名、狀態查詢、後台審核等功能。

## 技術架構

| 層級 | 技術 |
|------|------|
| Frontend | Nuxt 3 + Tailwind CSS |
| Backend | Nest.js + Prisma ORM |
| Database | PostgreSQL |
| Deployment | Zeabur (Docker) |

## 功能總覽

### 前台（公開）
- **首頁** — 宣傳 Banner + 賽事列表
- **賽事詳情** — 報名時間、說明、規則 PDF 下載
- **報名表單** — 三步驟 Wizard（隊伍資訊 → 選手資料 → 確認送出）
- **隊伍一覽** — 僅顯示隊名與審核狀態，不含任何個資

### 後台（需登入）
- **管理面板** — 選擇賽事、篩選狀態、展開檢視選手明細
- **審核操作** — 通過 / 退回（可附原因）/ 重設為審核中

### 安全機制
- 身分證字號以 AES-256-CBC 加密儲存，可由管理員解密查閱
- 管理員 API 回傳身分證時透過 per-session transport key 二次加密傳輸
- 前端使用 Web Crypto API 解密顯示，API 攔截無法取得明文
- API Rate Limiting（報名 5 次/分鐘、登入 5 次/分鐘）
- 登入暴力破解防護（連續失敗 10 次鎖定 15 分鐘）
- 公開 API 嚴格限制回傳欄位（僅隊名、狀態、選手姓名與角色）

## 本機開發

### 前置需求
- Node.js 20+
- PostgreSQL 14+

### 啟動步驟

```bash
# 1. 安裝根目錄依賴
npm install

# 2. 後端設定
cd backend
cp .env.example .env
# 編輯 .env，填入 PostgreSQL 連線資訊與管理員帳密

npm install
npx prisma migrate dev    # 建立資料表
npx ts-node prisma/seed.ts  # 塞入測試資料
npm run start:dev          # 啟動後端 → http://localhost:3002

# 3. 前端設定（另開終端機）
cd frontend
npm install
npm run dev                # 啟動前端 → http://localhost:3000
```

### 環境變數

<details>
<summary>Backend (.env)</summary>

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/airsoft_racing"
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-random-secret-key
FRONTEND_URL=http://localhost:3000
PORT=3002
```
</details>

<details>
<summary>Frontend</summary>

```env
NUXT_PUBLIC_API_BASE=http://localhost:3002/api
```
</details>

## 專案結構

```
airsoftRacing/
├── frontend/                    # Nuxt 3
│   ├── pages/
│   │   ├── index.vue            # 首頁
│   │   ├── tournament/[slug]/   # 賽事相關頁面
│   │   │   ├── index.vue        #   賽事詳情
│   │   │   ├── register.vue     #   報名表單
│   │   │   └── teams.vue        #   隊伍一覽
│   │   └── admin/               # 管理後台
│   │       ├── index.vue        #   登入
│   │       └── dashboard.vue    #   管理面板
│   ├── layouts/                 # default + admin
│   ├── components/              # StatusBadge, AppButton
│   ├── composables/             # useApi, useCrypto (AES 解密)
│   └── types/                   # TypeScript 型別定義
│
├── backend/                     # Nest.js
│   ├── src/
│   │   ├── tournament/          # 賽事 API
│   │   ├── registration/        # 報名 API
│   │   ├── admin/               # 後台管理 API
│   │   ├── common/              # 加密工具（AES 儲存 + 傳輸）
│   │   └── prisma/              # 資料庫服務
│   ├── prisma/
│   │   ├── schema.prisma        # 資料庫 Schema
│   │   ├── seed.ts              # 測試資料
│   │   └── migrations/          # 資料庫遷移
│   └── public/                  # 靜態檔案（PDF、圖片）
│
├── CLAUDE.md                    # AI 開發脈絡文件
├── SECURITY_AUDIT.md            # 資安檢測報告
└── README.md
```

## 資料庫 Schema

```
Tournament (賽事)
├── Team (隊伍) ── status: PENDING | SUCCESS | FAILED
│   └── Player (選手) ── role: CAPTAIN | STARTER | SUBSTITUTE
```

- 每隊必須：1 隊長 + 3 隊員 + 0~2 候補隊員（共 4~6 人）
- 同一屆賽事中隊名不可重複
- 身分證僅驗證必填與長度（10 碼），不驗證格式與重複

## API 端點

| Method | Endpoint | 說明 |
|--------|----------|------|
| `GET` | `/api/tournaments` | 賽事列表 |
| `GET` | `/api/tournaments/:slug` | 賽事詳情 |
| `POST` | `/api/tournaments/:slug/register` | 提交報名 |
| `GET` | `/api/tournaments/:slug/teams` | 公開隊伍列表 |
| `POST` | `/api/admin/login` | 管理員登入 |
| `GET` | `/api/admin/tournaments/:slug/teams` | 管理員隊伍列表 |
| `GET` | `/api/admin/teams/:id` | 隊伍明細 |
| `PATCH` | `/api/admin/teams/:id/review` | 審核操作 |

## 部署到 Zeabur

1. 推送到 GitHub
2. Zeabur 建立專案 → 新增 PostgreSQL 服務
3. 新增 backend 服務（Root Directory: `backend`）
4. 新增 frontend 服務（Root Directory: `frontend`）
5. 設定各服務環境變數
6. 綁定網域

後端 Dockerfile 內建 `prisma migrate deploy`，首次部署自動建表。

## License

Private project. All rights reserved.
