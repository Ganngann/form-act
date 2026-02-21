import { IsOptional, IsString } from 'class-validator';

export class UpdateEmailTemplateDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  body?: string;
}
