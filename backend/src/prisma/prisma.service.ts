import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();

    // Auto-fix: update banner to webp format
    await this.tournament.updateMany({
      where: { slug: 'season-1', bannerUrl: '/public/hero-banner.svg' },
      data: { bannerUrl: '/public/banner.webp' },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
