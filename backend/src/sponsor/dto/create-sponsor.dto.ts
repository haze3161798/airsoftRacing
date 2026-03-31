import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateSponsorDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: '請輸入有效的網址' })
  @MaxLength(500)
  linkUrl?: string;
}
