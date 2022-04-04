import { Expose, Transform } from 'class-transformer';
import { IsString, IsUUID, IsDate, IsBoolean } from 'class-validator';

export class ResponseCategoryDto {
  @IsUUID()
  id?: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsBoolean()
  is_global: boolean;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;

  @Transform(({ value }) => value?.exercises_categories)
  @Expose({ name: 'exercises_count' })
  _count?: {
    exercises_categories: number;
  };

  constructor(partial: Partial<ResponseCategoryDto>) {
    Object.assign(this, partial);
  }
}
