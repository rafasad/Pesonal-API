import { IsOptional, IsString, IsUrl } from 'class-validator';
import { isModelIdExists } from 'src/validators/model.id.exists.validator';

export class CreateExerciseDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  video_url?: string;

  @isModelIdExists('user', 'User')
  @IsOptional()
  teacher_id?: string;

  @isModelIdExists('category', 'Category', true)
  @IsOptional()
  categories?: Array<string>;
}
