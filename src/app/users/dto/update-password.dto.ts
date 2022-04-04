import { IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  last_password: string;

  @IsString()
  new_password: string;
}
