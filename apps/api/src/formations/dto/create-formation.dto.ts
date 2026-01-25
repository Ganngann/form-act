import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, IsUrl } from "class-validator";

export class CreateFormationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  level: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsString()
  @IsNotEmpty()
  durationType: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  expertiseId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsString()
  @IsOptional()
  @IsUrl()
  programLink?: string;

  @IsString()
  @IsOptional()
  methodology?: string;

  @IsString()
  @IsOptional()
  inclusions?: string;

  @IsString()
  @IsOptional()
  agreementCode?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
