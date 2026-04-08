import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrizeController } from './prize.controller';
import { PrizeService } from './prize.service';
import { AdminGuard } from '../admin/admin.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET must be set') })(),
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [PrizeController],
  providers: [PrizeService, AdminGuard],
})
export class PrizeModule {}
