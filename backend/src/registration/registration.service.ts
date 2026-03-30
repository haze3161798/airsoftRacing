import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterTeamDto, PlayerRole } from './dto/register-team.dto';
import { createHash } from 'crypto';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  private hashNationalId(nationalId: string, tournamentId: string): string {
    // Use tournament ID as salt so same person gets same hash within a tournament
    return createHash('sha256')
      .update(`${tournamentId}:${nationalId}`)
      .digest('hex');
  }

  private validateTaiwanNationalId(id: string): boolean {
    // 支援舊式(1,2) + 新式居留證(8,9)
    if (!/^[A-Z][1289]\d{8}$/.test(id)) return false;

    const letterMap: Record<string, number> = {
      A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17,
      I: 34, J: 18, K: 19, L: 20, M: 21, N: 22, O: 35, P: 23,
      Q: 24, R: 25, S: 26, T: 27, U: 28, V: 29, W: 32, X: 30,
      Y: 31, Z: 33,
    };

    const letterValue = letterMap[id[0]];
    const n1 = Math.floor(letterValue / 10);
    const n2 = letterValue % 10;

    const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    let sum = n1 + n2 * 9;

    for (let i = 1; i < 10; i++) {
      sum += parseInt(id[i]) * weights[i];
    }

    return sum % 10 === 0;
  }

  async register(slug: string, dto: RegisterTeamDto) {
    // 1. Find tournament
    const tournament = await this.prisma.tournament.findUnique({
      where: { slug },
    });
    if (!tournament) {
      throw new NotFoundException(`賽事 "${slug}" 不存在`);
    }

    // 2. Check registration window
    const now = new Date();
    if (tournament.registrationOpenAt && now < tournament.registrationOpenAt) {
      throw new BadRequestException('報名尚未開始');
    }
    if (tournament.registrationCloseAt && now > tournament.registrationCloseAt) {
      throw new BadRequestException('報名已截止');
    }

    // 3. Validate player role composition: 1 CAPTAIN + 5 STARTER + 0~2 SUBSTITUTE
    const roleCounts = dto.players.reduce(
      (acc, p) => {
        acc[p.role] = (acc[p.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    if (roleCounts[PlayerRole.CAPTAIN] !== 1) {
      throw new BadRequestException('必須恰好有 1 名隊長 (CAPTAIN)');
    }
    if (roleCounts[PlayerRole.STARTER] !== 5) {
      throw new BadRequestException('必須恰好有 5 名先發 (STARTER)');
    }
    const subCount = roleCounts[PlayerRole.SUBSTITUTE] || 0;
    if (subCount > 2) {
      throw new BadRequestException('替補最多 2 名 (SUBSTITUTE)');
    }

    // 4. Validate national IDs (checksum)
    for (const player of dto.players) {
      if (!this.validateTaiwanNationalId(player.nationalId)) {
        throw new BadRequestException(
          `選手「${player.name}」的身分證字號格式不正確`,
        );
      }
    }

    // 5. Check for duplicate national IDs within this submission
    const nationalIds = dto.players.map((p) => p.nationalId);
    const uniqueIds = new Set(nationalIds);
    if (uniqueIds.size !== nationalIds.length) {
      throw new BadRequestException('同一隊伍中不可有重複的身分證字號');
    }

    // 6. Hash national IDs and check for duplicates across teams in this tournament
    const hashes = dto.players.map((p) =>
      this.hashNationalId(p.nationalId, tournament.id),
    );

    const existingPlayers = await this.prisma.player.findMany({
      where: {
        tournamentId: tournament.id,
        nationalIdHash: { in: hashes },
      },
      include: { team: { select: { teamName: true } } },
    });

    if (existingPlayers.length > 0) {
      const names = existingPlayers.map(
        (p) => `${p.name}（已在隊伍「${p.team.teamName}」中）`,
      );
      throw new BadRequestException(
        `以下選手已在本屆賽事中報名：${names.join('、')}`,
      );
    }

    // 7. Create team + players in a transaction
    const team = await this.prisma.$transaction(async (tx) => {
      const newTeam = await tx.team.create({
        data: {
          tournamentId: tournament.id,
          teamName: dto.teamName,
          paymentNote: dto.paymentNote,
          status: 'PENDING',
        },
      });

      await tx.player.createMany({
        data: dto.players.map((p, index) => ({
          teamId: newTeam.id,
          tournamentId: tournament.id,
          name: p.name,
          phone: p.phone,
          nationalIdHash: this.hashNationalId(p.nationalId, tournament.id),
          role: p.role,
          sortOrder: index,
        })),
      });

      return newTeam;
    });

    return {
      success: true,
      data: {
        teamId: team.id,
        teamName: team.teamName,
        status: team.status,
        message: '報名成功，請等待審核。',
      },
    };
  }

  async getPublicTeamList(slug: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { slug },
    });
    if (!tournament) {
      throw new NotFoundException(`賽事 "${slug}" 不存在`);
    }

    const teams = await this.prisma.team.findMany({
      where: { tournamentId: tournament.id },
      select: { teamName: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    return { data: teams };
  }
}
