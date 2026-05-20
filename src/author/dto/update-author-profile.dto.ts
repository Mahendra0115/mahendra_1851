import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAuthorProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(4)
  password?: string;
}
