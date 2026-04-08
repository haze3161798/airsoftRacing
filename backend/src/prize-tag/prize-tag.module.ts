import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrizeTagController } from './prize-tag.controller';
import { PrizeTagService } from './prize-tag.service';
import { AdminGuard } from '../admin/admin.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET must be set') })(),
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [PrizeTagController],
  providers: [PrizeTagService, AdminGuard],
})
export class PrizeTagModule {}
