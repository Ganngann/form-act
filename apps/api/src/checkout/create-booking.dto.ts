import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsISO8601,
  IsOptional,
} from "class-validator";

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  vatNumber: string;

  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsUUID()
  formationId: string;

  @IsUUID()
  @IsOptional()
  trainerId?: string;

  @IsISO8601()
  date: string;

  @IsNotEmpty()
  @IsString()
  slot: string;
}
