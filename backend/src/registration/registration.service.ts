import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterTeamDto, PlayerRole } from './dto/register-team.dto';
import { encrypt } from '../common/crypto.util';
import { generateTransportKey, transportDecrypt } from '../common/transport-crypto';

// Transport keys for registration (5 min TTL)
const transportKeys = new Map<string, { key: string; expiresAt: number }>();
const TRANSPORT_KEY_TTL = 5 * 60 * 1000;

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  generateRegistrationKey(): { keyId: string; transportKey: string } {
    // Clean expired keys
    const now = Date.now();
    for (const [id, entry] of transportKeys) {
      if (entry.expiresAt < now) transportKeys.delete(id);
    }

    const transportKey = generateTransportKey();
    const keyId = crypto.randomUUID();
    transportKeys.set(keyId, { key: transportKey, expiresAt: now + TRANSPORT_KEY_TTL });
    return { keyId, transportKey };
  }

  private getTransportKey(keyId: string): string | null {
    const entry = transportKeys.get(keyId);
    if (!entry || entry.expiresAt < Date.now()) {
      transportKeys.delete(keyId);
      return null;
    }
    transportKeys.delete(keyId); // One-time use
    return entry.key;
  }

  private encryptField(value: string): string {
    return encrypt(value);
  }

  async register(slug: string, dto: RegisterTeamDto, keyId?: string) {
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

    // 4. Decrypt transport-encrypted fields if keyId provided
    const tk = keyId ? this.getTransportKey(keyId) : null;
    if (keyId && !tk) {
      throw new BadRequestException('加密金鑰已過期，請重新整理頁面');
    }

    // Decrypt phone + nationalId if transport-encrypted
    const decryptedPlayers = dto.players.map((p) => ({
      ...p,
      phone: tk ? transportDecrypt(p.phone, tk) : p.phone,
      nationalId: tk ? transportDecrypt(p.nationalId, tk) : p.nationalId,
    }));

    // 5. Validate decrypted fields
    const phoneRegex = /^09\d{8}$/;
    for (const player of decryptedPlayers) {
      if (!phoneRegex.test(player.phone)) {
        throw new BadRequestException(
          `選手「${player.name}」的手機號碼格式錯誤（09 開頭共 10 碼）`,
        );
      }
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
        data: decryptedPlayers.map((p, index) => ({
          teamId: newTeam.id,
          tournamentId: tournament.id,
          name: p.name,
          phone: this.encryptField(p.phone),
          nationalIdHash: this.encryptField(p.nationalId),
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
