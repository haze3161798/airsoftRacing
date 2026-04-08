import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { TournamentModule } from './tournament/tournament.module';
import { RegistrationModule } from './registration/registration.module';
import { AdminModule } from './admin/admin.module';
import { SponsorModule } from './sponsor/sponsor.module';
import { PrizeTagModule } from './prize-tag/prize-tag.module';
import { PrizeModule } from './prize/prize.module';

@Module({
  imports: [
    // Serve static files (PDFs, etc.) from /public
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
      serveRoot: '/public',
    }),
    // Rate limiting: default 60 requests per minute
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    PrismaModule,
    TournamentModule,
    RegistrationModule,
    AdminModule,
    SponsorModule,
    PrizeTagModule,
    PrizeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
