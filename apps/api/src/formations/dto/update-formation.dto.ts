import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsUrl,
  IsArray,
} from "class-validator";

export class UpdateFormationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  durationType?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isExpertise?: boolean;

  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  trainerIds?: string[];

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
  agreementCodes?: string; // JSON string

  @IsString()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
