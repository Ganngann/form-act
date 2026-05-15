import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SendTestEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  body?: string;
}
