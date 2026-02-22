import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  IsUrl,
  ValidateIf,
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

  @IsOptional()
  @IsUUID("4", { each: true })
  authorizedTrainerIds?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.programLink && o.programLink !== "")
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
  agreementCodes?: string;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.imageUrl && o.imageUrl !== "")
  @IsUrl()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
