import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsUrl,
  IsArray,
} from "class-validator";

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
