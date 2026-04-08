import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminGuard } from '../admin/admin.guard';
import { PrizeTagService } from './prize-tag.service';
import { CreatePrizeTagDto } from './dto/create-prize-tag.dto';
import { UpdatePrizeTagDto } from './dto/update-prize-tag.dto';

@Controller()
export class PrizeTagController {
  constructor(private readonly prizeTagService: PrizeTagService) {}

  // ─── 公開 API ───

  /** 前台取得全部標籤 */
  @Get('prize-tags')
  getAllTags() {
    return this.prizeTagService.getAllTags();
  }

  // ─── Admin API ───

  /** 後台取得全部標籤（含使用數量） */
  @Get('admin/prize-tags')
  @UseGuards(AdminGuard)
  getAllTagsAdmin() {
    return this.prizeTagService.getAllTagsAdmin();
  }

  /** 後台新增標籤 */
  @Post('admin/prize-tags')
  @UseGuards(AdminGuard)
  createTag(@Body() dto: CreatePrizeTagDto) {
    return this.prizeTagService.createTag(dto.name);
  }

  /** 後台更新標籤 */
  @Patch('admin/prize-tags/:id')
  @UseGuards(AdminGuard)
  updateTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrizeTagDto,
  ) {
    return this.prizeTagService.updateTag(id, dto);
  }

  /** 後台刪除標籤 */
  @Delete('admin/prize-tags/:id')
  @UseGuards(AdminGuard)
  deleteTag(@Param('id', ParseUUIDPipe) id: string) {
    return this.prizeTagService.deleteTag(id);
  }
}
