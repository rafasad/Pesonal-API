import { Exclude, Transform } from 'class-transformer';

export class ResponseExerciseDto {
  @Exclude()
  deleted_at: Date;

  @Transform(({ value }) => {
    return value.map(({ category }) => category);
  })
  exercises_categories?: Array<{
    category: {
      name: string;
      description: string;
    };
  }>;

  @Transform(({ value }) => {
    return value.map(({ name }) => name);
  })
  images?: Array<{
    name: string;
  }>;

  constructor(partial: Partial<ResponseExerciseDto>) {
    Object.assign(this, partial);
  }
}
