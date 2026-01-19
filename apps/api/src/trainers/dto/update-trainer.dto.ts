import { IsArray, IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateTrainerDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  predilectionZones?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  expertiseZones?: string[];
}
