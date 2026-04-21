/**
 * 生產環境用腳本：新增娛樂組 Tournament 紀錄
 *
 * 使用方式（在 Zeabur backend 服務或本機連生產 DB）：
 *   npx ts-node prisma/add-fun-tournament.ts
 *
 * 特性：
 *   - 使用 upsert，重複執行不會出錯
 *   - 不會清空其他資料（職業組隊伍、贊助商、獎品等完全不影響）
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.tournament.upsert({
    where: { slug: 'season-1-fun' },
    update: {},
    create: {
      slug: 'season-1-fun',
      name: '第一屆 極限速度杯\n娛樂組',
      description:
        '【第一屆 Speedsoft 類賽事 — 娛樂組報名資訊】\n\n歡迎報名第一屆 Speedsoft 類賽事！本賽事採用 4v4 搶旗模式，依賽事積分進行排名。\n\n娛樂組專為對 Speedsoft 賽制有興趣的玩家而設，將與職業組分開對戰，讓更多玩家能輕鬆體驗 Speedsoft 的樂趣，並深入認識此項運動。\n\n比賽日期：6 月 7 日（日）\n報名截止：5 月 22 日\n\n報名編制：每支隊伍由 1 名隊長及 3 名正式隊員組成，並可視需求增報最多 2 名替補人員。\n早鳥獎勵：凡於 5 月 4 日（含）前完成報名手續並成功繳費之隊伍，加碼獲贈「店家折扣禮券」。',
      rulesPdfUrl: '/public/rules-season-1-fun.pdf',
      bannerUrl: '/public/banner.webp',
      registrationOpenAt: new Date('2026-03-01T00:00:00+08:00'),
      registrationCloseAt: new Date('2026-05-22T23:59:59+08:00'),
      isActive: true,
    },
  });

  console.log(`✅ Tournament upserted: ${result.name} (${result.slug})`);
}

main()
  .catch((e) => {
    console.error('❌ Upsert failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
