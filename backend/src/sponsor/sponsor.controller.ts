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
import { SponsorService } from './sponsor.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Controller()
export class SponsorController {
  constructor(private readonly sponsorService: SponsorService) {}

  // ─── 公開 API ───

  /** 前台取得已上架贊助商列表 */
  @Get('sponsors')
  getActiveSponsors() {
    return this.sponsorService.getActiveSponsors();
  }

  /** 前台取得贊助商圖片 */
  @Get('sponsors/:id/image')
  async getSponsorImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { imageData, imageMimeType } = await this.sponsorService.getSponsorImage(id);
    const buffer = Buffer.from(imageData);
    res.set({
      'Content-Type': imageMimeType,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=86400',
    });
    res.end(buffer);
  }

  // ─── Admin API ───

  /** 後台取得全部贊助商 */
  @Get('admin/sponsors')
  @UseGuards(AdminGuard)
  getAllSponsors() {
    return this.sponsorService.getAllSponsors();
  }

  /** 後台新增贊助商 */
  @Post('admin/sponsors')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  createSponsor(
    @Body() dto: CreateSponsorDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.sponsorService.createSponsor(dto.name, file, dto.linkUrl);
  }

  /** 後台更新贊助商 */
  @Patch('admin/sponsors/:id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  updateSponsor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSponsorDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.sponsorService.updateSponsor(id, dto, file);
  }

  /** 後台刪除贊助商 */
  @Delete('admin/sponsors/:id')
  @UseGuards(AdminGuard)
  deleteSponsor(@Param('id', ParseUUIDPipe) id: string) {
    return this.sponsorService.deleteSponsor(id);
  }
}
