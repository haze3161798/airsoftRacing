import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PlayerRole {
  CAPTAIN = 'CAPTAIN',
  STARTER = 'STARTER',
  SUBSTITUTE = 'SUBSTITUTE',
}

export class PlayerDto {
  @IsString()
  @IsNotEmpty({ message: '姓名不可為空' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty({ message: '手機號碼不可為空' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: '身分證字號不可為空' })
  nationalId: string;

  @IsEnum(PlayerRole, { message: '角色必須為 CAPTAIN、STARTER 或 SUBSTITUTE' })
  role: PlayerRole;
}

export class RegisterTeamDto {
  @IsString()
  @IsNotEmpty({ message: '隊伍名稱不可為空' })
  @MaxLength(100)
  teamName: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  paymentNote?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(4, { message: '至少需要 4 名選手（1 隊長 + 3 隊員）' })
  @ArrayMaxSize(6, { message: '最多 6 名選手（1 隊長 + 3 隊員 + 2 候補）' })
  @Type(() => PlayerDto)
  players: PlayerDto[];
}
