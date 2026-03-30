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
  @IsNotEmpty({ message: '身分證字號不可為空' })
  @MaxLength(10, { message: '身分證字號長度須為 10 碼' })
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
