import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewTeamDto } from './dto/review-team.dto';

// Simple brute-force protection
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string, ip: string) {
    // Brute-force check
    const attempt = loginAttempts.get(ip);
    if (attempt && attempt.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil(
        (attempt.lockedUntil - Date.now()) / 60000,
      );
      throw new BadRequestException(
        `登入嘗試次數過多，請 ${minutesLeft} 分鐘後再試`,
      );
    }

    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'changeme';

    if (username !== adminUser || password !== adminPass) {
      // Track failed attempts
      const current = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
      current.count += 1;
      if (current.count >= 10) {
        current.lockedUntil = Date.now() + 15 * 60 * 1000; // Lock 15 min
        current.count = 0;
      }
      loginAttempts.set(ip, current);
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    // Reset on success
    loginAttempts.delete(ip);

    const token = await this.jwtService.signAsync({ sub: 'admin' });
    return { accessToken: token };
  }

  async getTeamsByTournament(slug: string, status?: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { slug },
    });
    if (!tournament) {
      throw new NotFoundException(`賽事 "${slug}" 不存在`);
    }

    const where: any = { tournamentId: tournament.id };
    if (status) {
      where.status = status;
    }

    return this.prisma.team.findMany({
      where,
      include: {
        players: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            sortOrder: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getTeamDetail(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        tournament: { select: { name: true, slug: true } },
        players: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!team) {
      throw new NotFoundException('隊伍不存在');
    }
    return team;
  }

  async reviewTeam(id: string, dto: ReviewTeamDto) {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new NotFoundException('隊伍不存在');
    }

    return this.prisma.team.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason || null,
        reviewedAt: new Date(),
      },
    });
  }
}
