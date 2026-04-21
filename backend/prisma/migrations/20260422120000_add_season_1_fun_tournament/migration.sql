-- Data migration: 新增娛樂組 Tournament 紀錄
-- 部署時由 `npx prisma migrate deploy` 自動執行；冪等 (ON CONFLICT DO NOTHING)，重跑無副作用
INSERT INTO tournament (
  id, slug, name, description, rules_pdf_url, banner_url,
  registration_open_at, registration_close_at, is_active,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'season-1-fun',
  E'第一屆 極限速度杯\n娛樂組',
  E'【第一屆 Speedsoft 類賽事 — 娛樂組報名資訊】\n\n歡迎報名第一屆 Speedsoft 類賽事！本賽事採用 4v4 搶旗模式，依賽事積分進行排名。\n\n娛樂組專為對 Speedsoft 賽制有興趣的玩家而設，將與職業組分開對戰，讓更多玩家能輕鬆體驗 Speedsoft 的樂趣，並深入認識此項運動。\n\n比賽日期：6 月 7 日（日）\n報名截止：5 月 22 日\n\n報名編制：每支隊伍由 1 名隊長及 3 名正式隊員組成，並可視需求增報最多 2 名替補人員。\n早鳥獎勵：凡於 5 月 4 日（含）前完成報名手續並成功繳費之隊伍，加碼獲贈「店家折扣禮券」。',
  '/public/rules-season-1-fun.pdf',
  '/public/banner.webp',
  '2026-03-01 00:00:00+08',
  '2026-05-22 23:59:59+08',
  true,
  now(),
  now()
)
ON CONFLICT (slug) DO NOTHING;
