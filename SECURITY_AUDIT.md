# 資安檢測報告 — Airsoft Racing 報名平台

**檢測日期**：2026-03-30
**最後更新**：2026-03-31
**檢測範圍**：Frontend (Nuxt 3)、Backend (Nest.js)、Database (Prisma/PostgreSQL)、Deployment (Docker/Zeabur)

---

## 🔴 CRITICAL（立即修復）

### 1. `.env` 機密檔案疑似進入版控 ✅ 已確認安全
- **位置**：`backend/.env`
- **問題**：含資料庫密碼 `0000`、管理員密碼 `changeme`、JWT Secret
- **影響**：任何取得 repo 存取權的人可直接拿到所有憑證
- **修復**：用 `git filter-repo` 從歷史中移除，立即輪換所有密碼
- **✅ 狀態**：`.gitignore` 已包含 `.env`，不會進入版控。加密金鑰已從 `JWT_SECRET` 分離為獨立的 `ENCRYPTION_SECRET` 環境變數（2026-03-31）

### 2. 寫死的預設管理員密碼
- **位置**：`backend/src/admin/admin.service.ts:33-34`
- **問題**：`process.env.ADMIN_PASSWORD || 'changeme'` — 若 env var 未設定，系統以 `changeme` 運行
- **影響**：攻擊者可直接以預設帳密登入後台
- **修復**：啟動時偵測未設定 env var 則拒絕啟動（fail-fast）

### 3. 寫死的 JWT Secret fallback ✅ 已修復
- **位置**：`backend/src/admin/admin.module.ts:10`
- **問題**：`process.env.JWT_SECRET || 'dev-secret-change-in-production'`
- **影響**：攻擊者可用已知 secret 自行簽發合法 JWT
- **✅ 修復內容**（2026-03-31）：移除 hardcoded fallback，`JWT_SECRET` 未設定時拒絕啟動（fail-fast）

### 4. 缺少 HTTP 安全標頭（Helmet.js）
- **位置**：`backend/src/main.ts`
- **問題**：無 `X-Frame-Options`、`Content-Security-Policy`、`Strict-Transport-Security`、`X-Content-Type-Options` 等
- **影響**：容易受 Clickjacking、MIME sniffing、缺少 HSTS 保護
- **修復**：安裝並啟用 `helmet` 中介軟體

---

## 🟠 HIGH（部署前必須修復）

### 5. Timing Attack — 明文字串比對密碼 ✅ 已修復
- **位置**：`backend/src/admin/admin.service.ts`
- **問題**：`username !== adminUser || password !== adminPass` 非 constant-time 比對
- **影響**：攻擊者可透過回應時間差逐字猜出密碼
- **✅ 修復內容**（2026-03-31）：改用 `crypto.timingSafeEqual()` 比對，長度不同時亦執行 constant-time 比對避免洩漏長度資訊

### 6. IP Spoofing 繞過暴力破解防護 ✅ 已修復
- **位置**：`backend/src/main.ts`
- **問題**：`req.ip` 可透過 `X-Forwarded-For` 偽造
- **影響**：暴力破解鎖定機制完全失效
- **✅ 修復內容**（2026-03-31）：設定 `trust proxy: 'loopback'`，僅信任本機迴圈 proxy，防止外部偽造 IP

### 7. 暴力破解防護用 in-memory Map ⚠️ 已評估，維持現狀
- **位置**：`backend/src/admin/admin.service.ts:12`
- **問題**：重啟即清空，多實例無法共享
- **影響**：攻擊者只要等伺服器重啟或切到另一實例即可繞過
- **⚠️ 評估結果**（2026-03-31）：目前為單實例部署（Zeabur），引入 Redis 成本過高。搭配 #5 timing-safe 比對 + #6 trust proxy + throttler 速率限制，風險已大幅降低。未來多實例部署時再改用 Redis

### 8. JWT Guard 未驗證 payload ✅ 已修復
- **位置**：`backend/src/admin/admin.guard.ts`
- **問題**：只呼叫 `verifyAsync(token)` 但不檢查 `sub` claim
- **影響**：任何合法簽發的 JWT（即使不是 admin）都能通過
- **✅ 修復內容**（2026-03-31）：加入 `payload.sub !== 'admin'` 驗證，不符時拋出「權限不足」

### 9. Token 有效期調整 ✅ 已修復
- **問題**：JWT 8 小時有效期，無 refresh token
- **影響**：密碼外洩後無法立即使已發出的 token 失效
- **✅ 修復內容**（2026-03-31）：有效期改為 24 小時（PO 需求），前端 cookie maxAge 同步調整。單帳號系統暫不需 refresh token 機制

### 10. Docker 容器以 root 運行 ✅ 已修復
- **位置**：`backend/Dockerfile`、`frontend/Dockerfile`
- **問題**：無 `USER` 指令
- **影響**：容器逃逸時攻擊者直接獲得 root 權限
- **✅ 修復內容**（2026-03-31）：前後端 Dockerfile 皆加入 `addgroup/adduser` 建立非 root 用戶 `appuser`，並以 `USER appuser` 執行，檔案 `--chown` 設定正確

### 11. Admin Cookie 未設 secure / sameSite ✅ 已修復
- **位置**：`frontend/pages/admin/index.vue`、`frontend/pages/admin/dashboard.vue`
- **問題**：`useCookie('admin_token', { maxAge: ... })` 無安全旗標
- **影響**：MITM 可攔截 cookie；CSRF 風險
- **✅ 修復內容**（2026-03-31）：加入 `secure: true`（production 啟用）+ `sameSite: 'strict'`。注意：Nuxt `useCookie` 需在前端讀取 token，故無法設定 `httpOnly`（由瀏覽器限制）

### 12. 電話號碼明文儲存 ✅ 已修復
- **位置**：`backend/prisma/schema.prisma`、`registration.service.ts`、`admin.service.ts`
- **問題**：`phone` 欄位未加密
- **影響**：資料庫外洩即曝露所有選手電話
- **✅ 修復內容**（2026-03-31）：
  - 報名時 phone 以 AES-256-CBC 加密儲存（與身分證同方式）
  - Admin API 回傳時 phone 經 transport key 重新加密
  - 前端 dashboard 用 transport key 解密顯示
  - DB 欄位加大至 VarChar(128) 容納加密字串

---

## 🟡 MEDIUM（近期修復）

### 13. 加密金鑰衍生方式不安全 ✅ 已修復
- **位置**：`backend/src/common/crypto.util.ts`
- **原問題**：使用 `padEnd('0').slice(0,32)` 產生 AES 金鑰，密碼學上極不安全；且與 JWT 共用同一個 `JWT_SECRET`
- **✅ 修復內容**（2026-03-31）：
  - 金鑰衍生改用 **PBKDF2**（100,000 iterations, SHA-256）
  - 新增獨立環境變數 `ENCRYPTION_SECRET`，與 `JWT_SECRET` 完全分離
  - 啟動時驗證 `ENCRYPTION_SECRET` 必須存在且 ≥ 32 字元（fail-fast）
  - 金鑰結果快取，避免重複運算

### 14. 錯誤訊息洩漏隊伍資訊
- **位置**：`backend/src/registration/registration.service.ts:78-80`
- **問題**：「選手已在隊伍 XXX 中」暴露其他隊伍名稱
- **修復**：只回傳「該身分證已報名」，不透露隊伍名稱

### 15. admin `status` 查詢參數未驗證
- **位置**：`backend/src/admin/admin.service.ts:59-61`
- **問題**：`where.status = status` 直接傳入，未限定 enum 值
- **修復**：加入白名單驗證 `['PENDING','SUCCESS','FAILED']`

### 16. 無管理員操作稽核日誌
- **問題**：審核、改狀態等敏感操作無 audit log
- **影響**：無法追蹤誰在何時做了什麼
- **修復**：加入 audit_log 表記錄操作

### 17. Open Redirect 風險
- **位置**：前端 `bannerUrl` / `rulesPdfUrl` URL 拼接邏輯
- **問題**：若 DB 中 URL 被竄改為 `//evil.com`，前端會直接導向
- **修復**：驗證 URL 必須為相對路徑或白名單域名

### 18. Devtools 生產環境未關閉
- **位置**：`frontend/nuxt.config.ts:4`
- **問題**：`devtools: { enabled: true }` 應在 production 關閉

### 19. .gitignore 不完整
- **問題**：缺少 `*.pem`、`*.key`、`.env.production`、`.vscode/`、`npm-debug.log*` 等
- **修復**：補齊敏感檔案模式

---

## 🟢 LOW（建議改善）

| # | 問題 | 位置 |
|---|------|------|
| 20 | `console.log` 生產環境洩漏資訊 | `backend/src/main.ts:31` |
| 21 | 無 CSP (Content Security Policy) | `frontend/nuxt.config.ts` |
| 22 | 無 Subresource Integrity (SRI) | 前端外部資源 |
| 23 | JWT 未明確指定 algorithm | `backend/src/admin/admin.module.ts` |
| 24 | ~~無密碼強度要求~~ — 不需修復（單帳號系統，密碼由 env var 控管） | 單帳號系統 |

---

## 修復優先順序

| 優先級 | 行動項目 | 預估工作量 |
|--------|---------|-----------|
| ✅ **P0** | `.env` 已在 `.gitignore`；加密金鑰分離為 `ENCRYPTION_SECRET` | ✅ 完成 |
| ✅ **P0** | `ENCRYPTION_SECRET` 未設定時 fail-fast 拒絕啟動 + PBKDF2 金鑰衍生 | ✅ 完成 |
| **P1 部署前** | 安裝 Helmet.js + 安全標頭 | 小 |
| ✅ **P1** | `crypto.timingSafeEqual` 密碼比對 | ✅ 完成 |
| ✅ **P1** | Cookie 加上 secure / sameSite | ✅ 完成 |
| ✅ **P1** | JWT Guard 驗證 payload claim | ✅ 完成 |
| ✅ **P1** | Docker 非 root 用戶 | ✅ 完成 |
| ✅ **P1** | 設定 trust proxy + 修正 IP 取得邏輯 | ✅ 完成 |
| **P2 近期** | 錯誤訊息去除隊伍名稱 | 小 |
| **P2 近期** | admin status 參數白名單 | 小 |
| **P2 近期** | 稽核日誌表 | 中 |
| ⚠️ **P3** | Redis 暴力破解防護（單實例暫不需要） | 中 |
| **P3 後續** | Refresh token 機制 | 中 |
| ✅ **P3** | 電話 AES-256-CBC 加密儲存 + transport 加密傳輸 | ✅ 完成 |
