import { IsBoolean, IsOptional, IsString } from "class-validator";

export class AdminUpdateSessionDto {
  @IsString()
  @IsOptional()
  trainerId?: string;

  @IsBoolean()
  @IsOptional()
  isLogisticsOpen?: boolean;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  logistics?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
