import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTrainerDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  predilectionZones?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  expertiseZones?: string[];

  @IsString()
  @IsOptional()
  bio?: string;
}
