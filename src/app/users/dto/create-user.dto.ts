import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { IsUserEmailNotExists } from 'src/validators/user.email.not-exists.validator';
import { Role } from '../../../enums/role.enum';

export class CreateUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  @IsUserEmailNotExists()
  email: string;

  @IsString()
  password: string;

  @IsEnum(Role, {
    each: true,
    message: 'Utilizar uma regra válida',
  })
  roles: Array<Role>;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  deleted_at?: string | Date;
}
