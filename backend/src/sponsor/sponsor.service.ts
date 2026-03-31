import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class SponsorService {
  constructor(private prisma: PrismaService) {}

  /** 公開 — 只回傳已上架的贊助商（不含圖片 binary） */
  async getActiveSponsors() {
    return this.prisma.sponsor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        linkUrl: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** 公開 — 回傳圖片 binary */
  async getSponsorImage(id: string) {
    const sponsor = await this.prisma.sponsor.findUnique({
      where: { id },
      select: { imageData: true, imageMimeType: true },
    });
    if (!sponsor) {
      throw new NotFoundException('贊助商不存在');
    }
    return sponsor;
  }

  /** Admin — 列出全部贊助商（不含圖片 binary） */
  async getAllSponsors() {
    return this.prisma.sponsor.findMany({
      select: {
        id: true,
        name: true,
        linkUrl: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** Admin — 新增贊助商 */
  async createSponsor(
    name: string,
    file: Express.Multer.File,
    linkUrl?: string,
  ) {
    this.validateImage(file);

    // 新贊助商排到最後
    const maxSort = await this.prisma.sponsor.aggregate({
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    return this.prisma.sponsor.create({
      data: {
        name,
        imageData: Buffer.from(file.buffer),
        imageMimeType: file.mimetype,
        linkUrl: linkUrl || null,
        isActive: true,
        sortOrder: nextSort,
      },
      select: {
        id: true,
        name: true,
        linkUrl: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
      },
    });
  }

  /** Admin — 更新贊助商 */
  async updateSponsor(
    id: string,
    dto: UpdateSponsorDto,
    file?: Express.Multer.File,
  ) {
    const sponsor = await this.prisma.sponsor.findUnique({ where: { id } });
    if (!sponsor) {
      throw new NotFoundException('贊助商不存在');
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.clearLinkUrl) {
      data.linkUrl = null;
    } else if (dto.linkUrl !== undefined) {
      data.linkUrl = dto.linkUrl;
    }
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    if (file) {
      this.validateImage(file);
      data.imageData = Buffer.from(file.buffer);
      data.imageMimeType = file.mimetype;
    }

    return this.prisma.sponsor.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        linkUrl: true,
        isActive: true,
        sortOrder: true,
        updatedAt: true,
      },
    });
  }

  /** Admin — 刪除贊助商 */
  async deleteSponsor(id: string) {
    const sponsor = await this.prisma.sponsor.findUnique({ where: { id } });
    if (!sponsor) {
      throw new NotFoundException('贊助商不存在');
    }
    await this.prisma.sponsor.delete({ where: { id } });
    return { message: '已刪除' };
  }

  private validateImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('請上傳圖片');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('僅支援 PNG、JPG、WebP、SVG 格式');
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('圖片大小不可超過 5MB');
    }
  }
}
