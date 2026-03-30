import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.tournament.deleteMany();

  // Create Season 1
  const season1 = await prisma.tournament.create({
    data: {
      slug: 'season-1',
      name: '第一屆氣槍競速賽',
      description:
        '歡迎參加第一屆氣槍競速電競賽事！\n\n本賽事採用 5v5 競速模式，每隊需有 1 名隊長、5 名先發選手及 2 名替補選手。\n報名後請依指示完成繳費，經主辦方審核通過即完成報名。',
      rulesPdfUrl: '/public/rules-season-1.pdf',
      bannerUrl: '/public/hero-banner.svg',
      registrationOpenAt: new Date('2026-03-01T00:00:00+08:00'),
      registrationCloseAt: new Date('2026-12-31T23:59:59+08:00'),
      isActive: true,
    },
  });

  console.log(`✅ Created tournament: ${season1.name} (${season1.slug})`);


  // Create a sample team for Season 1 (to verify admin panel)
  const sampleTeam = await prisma.team.create({
    data: {
      tournamentId: season1.id,
      teamName: '測試戰隊 Alpha',
      status: 'PENDING',
      paymentNote: '後五碼 99887',
    },
  });

  // Create 8 players for the sample team
  const samplePlayers = [
    { name: '王大明', phone: '0912345678', role: 'CAPTAIN', nationalIdHash: 'seed_hash_captain_001' },
    { name: '李小華', phone: '0922111222', role: 'STARTER', nationalIdHash: 'seed_hash_starter_001' },
    { name: '張美玲', phone: '0933222333', role: 'STARTER', nationalIdHash: 'seed_hash_starter_002' },
    { name: '陳志明', phone: '0944333444', role: 'STARTER', nationalIdHash: 'seed_hash_starter_003' },
    { name: '林佳慧', phone: '0955444555', role: 'STARTER', nationalIdHash: 'seed_hash_starter_004' },
    { name: '黃建國', phone: '0966555666', role: 'STARTER', nationalIdHash: 'seed_hash_starter_005' },
    { name: '劉雅琪', phone: '0977666777', role: 'SUBSTITUTE', nationalIdHash: 'seed_hash_sub_001' },
    { name: '吳宗翰', phone: '0988777888', role: 'SUBSTITUTE', nationalIdHash: 'seed_hash_sub_002' },
  ];

  await prisma.player.createMany({
    data: samplePlayers.map((p, i) => ({
      teamId: sampleTeam.id,
      tournamentId: season1.id,
      name: p.name,
      phone: p.phone,
      role: p.role,
      nationalIdHash: p.nationalIdHash,
      sortOrder: i,
    })),
  });

  console.log(`✅ Created sample team: ${sampleTeam.teamName} with 8 players`);

  // Create a second team (already approved)
  const team2 = await prisma.team.create({
    data: {
      tournamentId: season1.id,
      teamName: '閃電突擊隊',
      status: 'SUCCESS',
      paymentNote: '後五碼 12345',
      reviewedAt: new Date(),
    },
  });

  const team2Players = [
    { name: '趙一凡', phone: '0911222333', role: 'CAPTAIN', nationalIdHash: 'seed_hash_t2_cap' },
    { name: '錢二明', phone: '0922333444', role: 'STARTER', nationalIdHash: 'seed_hash_t2_s1' },
    { name: '孫三哲', phone: '0933444555', role: 'STARTER', nationalIdHash: 'seed_hash_t2_s2' },
    { name: '周四維', phone: '0944555666', role: 'STARTER', nationalIdHash: 'seed_hash_t2_s3' },
    { name: '鄭五福', phone: '0955666777', role: 'STARTER', nationalIdHash: 'seed_hash_t2_s4' },
    { name: '馮六安', phone: '0966777888', role: 'STARTER', nationalIdHash: 'seed_hash_t2_s5' },
    { name: '許七賢', phone: '0977888999', role: 'SUBSTITUTE', nationalIdHash: 'seed_hash_t2_sub1' },
    { name: '沈八達', phone: '0988999000', role: 'SUBSTITUTE', nationalIdHash: 'seed_hash_t2_sub2' },
  ];

  await prisma.player.createMany({
    data: team2Players.map((p, i) => ({
      teamId: team2.id,
      tournamentId: season1.id,
      name: p.name,
      phone: p.phone,
      role: p.role,
      nationalIdHash: p.nationalIdHash,
      sortOrder: i,
    })),
  });

  console.log(`✅ Created sample team: ${team2.teamName} (STATUS: SUCCESS)`);
  console.log('');
  console.log('🎉 Seed complete!');
  console.log('   - 1 tournament (season-1 active)');
  console.log('   - 2 teams (1 PENDING, 1 SUCCESS)');
  console.log('   - 16 players total');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
