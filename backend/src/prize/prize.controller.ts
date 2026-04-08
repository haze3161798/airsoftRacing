import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AdminGuard } from '../admin/admin.guard';
import { PrizeService } from './prize.service';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';

@Controller()
export class PrizeController {
  constructor(private readonly prizeService: PrizeService) {}

  // ─── 公開 API ───

  /** 前台取得已上架獎品 */
  @Get('prizes')
  getActivePrizes() {
    return this.prizeService.getActivePrizes();
  }

  /** 前台取得精選獎品（首頁用） */
  @Get('prizes/featured')
  getFeaturedPrizes() {
    return this.prizeService.getFeaturedPrizes();
  }

  /** 前台取得獎品圖片 */
  @Get('prizes/:id/image')
  async getPrizeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { imageData, imageMimeType } = await this.prizeService.getPrizeImage(id);
    const buffer = Buffer.from(imageData);
    res.set({
      'Content-Type': imageMimeType,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=86400',
    });
    res.end(buffer);
  }

  // ─── Admin API ───

  /** 後台取得全部獎品 */
  @Get('admin/prizes')
  @UseGuards(AdminGuard)
  getAllPrizes() {
    return this.prizeService.getAllPrizes();
  }

  /** 後台新增獎品 */
  @Post('admin/prizes')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  createPrize(
    @Body() dto: CreatePrizeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.prizeService.createPrize(dto.name, file, {
      description: dto.description,
      sponsorId: dto.sponsorId,
      prizeTagId: dto.prizeTagId,
    });
  }

  /** 後台更新獎品 */
  @Patch('admin/prizes/:id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  updatePrize(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePrizeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.prizeService.updatePrize(id, dto, file);
  }

  /** 後台刪除獎品 */
  @Delete('admin/prizes/:id')
  @UseGuards(AdminGuard)
  deletePrize(@Param('id', ParseUUIDPipe) id: string) {
    return this.prizeService.deletePrize(id);
  }
}
