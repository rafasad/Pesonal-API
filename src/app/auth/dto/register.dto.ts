import { IsEmail, IsString } from 'class-validator';
import { isModelIdExists } from 'src/validators/model.id.exists.validator';
import { IsUserEmailNotExists } from 'src/validators/user.email.not-exists.validator';

export class RegisterDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  @IsUserEmailNotExists()
  email: string;

  @IsString()
  password: string;

  @isModelIdExists('user', 'Teacher')
  @IsString()
  teacher_id: string;
}
