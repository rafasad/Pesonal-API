import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

export class UserDto extends PartialType(UpdateUserDto) {
  @IsOptional()
  reset_token?: string;

  @IsOptional()
  expire_reset_token?: string | Date;
}
