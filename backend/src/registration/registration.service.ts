import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterTeamDto, PlayerRole } from './dto/register-team.dto';
import { encrypt } from '../common/crypto.util';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  private encryptNationalId(nationalId: string): string {
    return encrypt(nationalId);
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

    // 3. Validate player role composition: 1 CAPTAIN + 4 STARTER + 1~2 SUBSTITUTE
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
    if (roleCounts[PlayerRole.STARTER] !== 3) {
      throw new BadRequestException('必須恰好有 3 名隊員 (STARTER)');
    }
    const subCount = roleCounts[PlayerRole.SUBSTITUTE] || 0;
    if (subCount > 2) {
      throw new BadRequestException('候補隊員最多 2 名 (SUBSTITUTE)');
    }

    // 4. Validate national IDs (length only)
    for (const player of dto.players) {
      if (!player.nationalId || player.nationalId.length !== 10) {
        throw new BadRequestException(
          `選手「${player.name}」的身分證字號長度須為 10 碼`,
        );
      }
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
          nationalIdHash: this.encryptNationalId(p.nationalId),
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
        message: '報名已送出，請等待確認。',
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
      select: {
        teamName: true,
        status: true,
        players: {
          select: { name: true, role: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return { data: teams };
  }
}
