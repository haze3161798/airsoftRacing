import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ReviewStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class ReviewTeamDto {
  @IsEnum(ReviewStatus, { message: '狀態必須為 PENDING、SUCCESS 或 FAILED' })
  status: ReviewStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
