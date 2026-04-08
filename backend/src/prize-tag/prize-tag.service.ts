import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePrizeTagDto } from './dto/update-prize-tag.dto';

@Injectable()
export class PrizeTagService {
  constructor(private prisma: PrismaService) {}

  /** 公開 — 取得全部標籤（供前台篩選用） */
  async getAllTags() {
    return this.prisma.prizeTag.findMany({
      select: { id: true, name: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** Admin — 取得全部標籤（含時間戳） */
  async getAllTagsAdmin() {
    return this.prisma.prizeTag.findMany({
      select: {
        id: true,
        name: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { prizes: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** Admin — 新增標籤 */
  async createTag(name: string) {
    const maxSort = await this.prisma.prizeTag.aggregate({
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    return this.prisma.prizeTag.create({
      data: { name, sortOrder: nextSort },
      select: { id: true, name: true, sortOrder: true, createdAt: true },
    });
  }

  /** Admin — 更新標籤 */
  async updateTag(id: string, dto: UpdatePrizeTagDto) {
    const tag = await this.prisma.prizeTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('標籤不存在');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    return this.prisma.prizeTag.update({
      where: { id },
      data,
      select: { id: true, name: true, sortOrder: true, updatedAt: true },
    });
  }

  /** Admin — 刪除標籤（關聯獎品會解除關聯） */
  async deleteTag(id: string) {
    const tag = await this.prisma.prizeTag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException('標籤不存在');

    await this.prisma.prizeTag.delete({ where: { id } });
    return { message: '已刪除' };
  }
}
