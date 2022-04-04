import { PartialType } from '@nestjs/mapped-types';
import { CreateExerciseDto } from './create-exercise.dto';
import { IsOptional, IsString } from 'class-validator';
import { isModelIdExists } from 'src/validators/model.id.exists.validator';

export class UpdateExerciseDto extends PartialType(CreateExerciseDto) {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @isModelIdExists('user', 'User')
  @IsOptional()
  teacher_id?: string;
}
