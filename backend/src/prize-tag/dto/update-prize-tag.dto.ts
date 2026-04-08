import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePrizeTagDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
