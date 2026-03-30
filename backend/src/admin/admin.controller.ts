import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ReviewTeamDto } from './dto/review-team.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Rate limit: 5 login attempts per minute
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return this.adminService.login(dto.username, dto.password, ip);
  }

  @Get('tournaments/:slug/teams')
  @UseGuards(AdminGuard)
  getTeams(
    @Param('slug') slug: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getTeamsByTournament(slug, status);
  }

  @Get('teams/:id')
  @UseGuards(AdminGuard)
  getTeamDetail(@Param('id') id: string) {
    return this.adminService.getTeamDetail(id);
  }

  @Patch('teams/:id/review')
  @UseGuards(AdminGuard)
  reviewTeam(@Param('id') id: string, @Body() dto: ReviewTeamDto) {
    return this.adminService.reviewTeam(id, dto);
  }
}
