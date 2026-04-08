import { IsString, MaxLength } from 'class-validator';

export class CreatePrizeTagDto {
  @IsString()
  @MaxLength(100)
  name: string;
}
