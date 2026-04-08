import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreatePrizeDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUUID()
  sponsorId?: string;

  @IsOptional()
  @IsUUID()
  prizeTagId?: string;
}
