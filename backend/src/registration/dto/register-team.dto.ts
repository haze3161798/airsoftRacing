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
  Matches,
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
  @Matches(/^09\d{8}$/, { message: '請輸入有效的台灣手機號碼（09 開頭共 10 碼）' })
  phone: string;

  @IsString()
  @Matches(/^[A-Z][1289]\d{8}$/, { message: '請輸入有效的身分證字號' })
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
  @ArrayMinSize(6, { message: '至少需要 6 名選手（1 隊長 + 5 先發）' })
  @ArrayMaxSize(8, { message: '最多 8 名選手（1 隊長 + 5 先發 + 2 替補）' })
  @Type(() => PlayerDto)
  players: PlayerDto[];
}
