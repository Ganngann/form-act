import { IsString, IsNotEmpty, IsEmail, IsOptional } from "class-validator";

export class CreateClientProfileDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  vatNumber: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
