import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePrizeDto } from './dto/update-prize.dto';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class PrizeService {
  constructor(private prisma: PrismaService) {}

  /** 公開 — 取得已上架獎品（不含圖片 binary） */
  async getActivePrizes() {
    return this.prisma.prize.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        isFeatured: true,
        sortOrder: true,
        sponsor: { select: { id: true, name: true } },
        prizeTag: { select: { id: true, name: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** 公開 — 取得精選獎品（首頁用），若無精選則自動取最前面的上架獎品 */
  async getFeaturedPrizes() {
    const select = {
      id: true,
      name: true,
      description: true,
      sortOrder: true,
      sponsor: { select: { id: true, name: true } },
      prizeTag: { select: { id: true, name: true } },
    } as const;

    const featured = await this.prisma.prize.findMany({
      where: { isActive: true, isFeatured: true },
      select,
      orderBy: { sortOrder: 'asc' },
    });

    if (featured.length > 0) return featured;

    // 沒有精選 → 自動取排序最前的 4 件上架獎品
    return this.prisma.prize.findMany({
      where: { isActive: true },
      select,
      orderBy: { sortOrder: 'asc' },
      take: 4,
    });
  }

  /** 公開 — 回傳獎品圖片 binary */
  async getPrizeImage(id: string) {
    const prize = await this.prisma.prize.findUnique({
      where: { id },
      select: { imageData: true, imageMimeType: true },
    });
    if (!prize) throw new NotFoundException('獎品不存在');
    return prize;
  }

  /** Admin — 列出全部獎品（不含圖片 binary） */
  async getAllPrizes() {
    return this.prisma.prize.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        isFeatured: true,
        isActive: true,
        sortOrder: true,
        sponsor: { select: { id: true, name: true } },
        prizeTag: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** Admin — 新增獎品 */
  async createPrize(
    name: string,
    file: Express.Multer.File,
    options: {
      description?: string;
      sponsorId?: string;
      prizeTagId?: string;
    },
  ) {
    this.validateImage(file);

    const maxSort = await this.prisma.prize.aggregate({
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    return this.prisma.prize.create({
      data: {
        name,
        description: options.description || null,
        imageData: Buffer.from(file.buffer),
        imageMimeType: file.mimetype,
        sponsorId: options.sponsorId || null,
        prizeTagId: options.prizeTagId || null,
        isFeatured: false,
        isActive: true,
        sortOrder: nextSort,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isFeatured: true,
        isActive: true,
        sortOrder: true,
        sponsor: { select: { id: true, name: true } },
        prizeTag: { select: { id: true, name: true } },
        createdAt: true,
      },
    });
  }

  /** Admin — 更新獎品 */
  async updatePrize(
    id: string,
    dto: UpdatePrizeDto,
    file?: Express.Multer.File,
  ) {
    const prize = await this.prisma.prize.findUnique({ where: { id } });
    if (!prize) throw new NotFoundException('獎品不存在');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.clearSponsor) {
      data.sponsorId = null;
    } else if (dto.sponsorId !== undefined) {
      data.sponsorId = dto.sponsorId;
    }
    if (dto.clearPrizeTag) {
      data.prizeTagId = null;
    } else if (dto.prizeTagId !== undefined) {
      data.prizeTagId = dto.prizeTagId;
    }
    if (dto.isFeatured !== undefined) data.isFeatured = dto.isFeatured;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    if (file) {
      this.validateImage(file);
      data.imageData = Buffer.from(file.buffer);
      data.imageMimeType = file.mimetype;
    }

    return this.prisma.prize.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        isFeatured: true,
        isActive: true,
        sortOrder: true,
        sponsor: { select: { id: true, name: true } },
        prizeTag: { select: { id: true, name: true } },
        updatedAt: true,
      },
    });
  }

  /** Admin — 刪除獎品 */
  async deletePrize(id: string) {
    const prize = await this.prisma.prize.findUnique({ where: { id } });
    if (!prize) throw new NotFoundException('獎品不存在');
    await this.prisma.prize.delete({ where: { id } });
    return { message: '已刪除' };
  }

  private validateImage(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('請上傳圖片');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('僅支援 PNG、JPG、WebP、SVG 格式');
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('圖片大小不可超過 5MB');
    }
  }
}
