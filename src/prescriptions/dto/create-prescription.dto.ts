import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

class PrescriptionItemDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  quantity?: number;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreatePrescriptionDto {
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items!: PrescriptionItemDto[];
}
