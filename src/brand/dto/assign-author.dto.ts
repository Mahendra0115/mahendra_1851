import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignAuthorDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  authorId: number;
}
