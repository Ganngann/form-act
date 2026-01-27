import { PartialType } from "@nestjs/mapped-types"; // Or from @nestjs/swagger if used, but mapped-types is standard
import { CreateCategoryDto } from "./create-category.dto";

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
