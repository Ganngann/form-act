import { IsNumber, IsOptional, IsArray, IsString } from "class-validator";

export class AdminBillSessionDto {
  @IsNumber()
  basePrice: number;

  @IsNumber()
  optionsFee: number;

  @IsArray()
  @IsString({ each: true })
  optionsDetails: string[];

  @IsNumber()
  distanceFee: number;

  @IsNumber()
  @IsOptional()
  adminAdjustment: number;

  @IsNumber()
  finalPrice: number;
}
