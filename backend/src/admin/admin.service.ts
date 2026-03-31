import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewTeamDto } from './dto/review-team.dto';
import { decrypt } from '../common/crypto.util';
import { generateTransportKey, transportEncrypt } from '../common/transport-crypto';

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

    const userMatch = this.safeEqual(username, adminUser);
    const passMatch = this.safeEqual(password, adminPass);
    if (!userMatch || !passMatch) {
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

    const transportKey = generateTransportKey();
    const token = await this.jwtService.signAsync({ sub: 'admin', tk: transportKey });
    return { accessToken: token, transportKey };
  }

  async getTeamsByTournament(slug: string, status?: string, transportKey?: string) {
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

    const teams = await this.prisma.team.findMany({
      where,
      include: {
        players: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            phone: true,
            nationalIdHash: true,
            role: true,
            sortOrder: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Decrypt from DB, then re-encrypt with transport key for response
    return teams.map((team) => ({
      ...team,
      players: team.players.map((p) => {
        const plainId = this.decryptField(p.nationalIdHash);
        const plainPhone = this.decryptField(p.phone);
        return {
          ...p,
          phone: transportKey ? transportEncrypt(plainPhone, transportKey) : undefined,
          nationalId: transportKey ? transportEncrypt(plainId, transportKey) : undefined,
          nationalIdHash: undefined,
        };
      }),
    }));
  }

  private safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      timingSafeEqual(bufA, bufA); // constant-time even on length mismatch
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  }

  private decryptField(encrypted: string): string {
    try {
      return decrypt(encrypted);
    } catch {
      return '(無法解密)';
    }
  }

  async getTeamDetail(id: string, transportKey?: string) {
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
    return {
      ...team,
      players: team.players.map((p) => {
        const plainId = this.decryptField(p.nationalIdHash);
        const plainPhone = this.decryptField(p.phone);
        return {
          ...p,
          phone: transportKey ? transportEncrypt(plainPhone, transportKey) : undefined,
          nationalId: transportKey ? transportEncrypt(plainId, transportKey) : undefined,
          nationalIdHash: undefined,
        };
      }),
    };
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
