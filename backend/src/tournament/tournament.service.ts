import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TournamentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { slug },
    });
    if (!tournament) {
      throw new NotFoundException(`賽事 "${slug}" 不存在`);
    }

    // Calculate registration status
    const now = new Date();
    let registrationStatus: 'UPCOMING' | 'OPEN' | 'CLOSED' = 'CLOSED';
    if (tournament.registrationOpenAt && tournament.registrationCloseAt) {
      if (now < tournament.registrationOpenAt) {
        registrationStatus = 'UPCOMING';
      } else if (now <= tournament.registrationCloseAt) {
        registrationStatus = 'OPEN';
      }
    }

    return { ...tournament, registrationStatus };
  }
}
