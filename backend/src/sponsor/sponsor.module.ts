import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SponsorController } from './sponsor.controller';
import { SponsorService } from './sponsor.service';
import { AdminGuard } from '../admin/admin.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET must be set') })(),
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [SponsorController],
  providers: [SponsorService, AdminGuard],
})
export class SponsorModule {}
