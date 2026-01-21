import { IsOptional, IsString } from "class-validator";

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  logistics?: string;

  @IsOptional()
  @IsString()
  participants?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
