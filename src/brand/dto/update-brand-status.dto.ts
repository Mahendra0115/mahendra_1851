import { IsEnum } from 'class-validator';
import { BrandStatus } from '../entities/brand.entity';

export class UpdateBrandStatusDto {
  @IsEnum(BrandStatus)
  status: BrandStatus;
}
