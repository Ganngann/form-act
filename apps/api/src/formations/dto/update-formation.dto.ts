import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsUrl,
  IsUUID,
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

  @IsUrl()
  @IsOptional()
  programLink?: string;

  @IsUUID()
  @IsOptional()
  expertiseId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  methodology?: string;

  @IsString()
  @IsOptional()
  inclusions?: string;

  @IsString()
  @IsOptional()
  agreementCode?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
