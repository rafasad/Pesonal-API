import { Exclude, Expose, Transform } from 'class-transformer';
import { IsString, IsUUID, IsDate, IsArray } from 'class-validator';

export class ResponseUserDto {
  @IsUUID()
  id?: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  bio?: string;

  @IsArray()
  roles: string[];

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;

  @Expose()
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  @Transform(({ value }) => value?.name || null)
  avatar?: {
    name: string;
    path: string;
  };

  @Transform(({ value }) => {
    return value.map(({ teacher }) => teacher);
  })
  teachers?: Array<{
    teacher: {
      id: string;
      first_name: string;
      last_name?: string;
      email: string;
    };
  }>;

  @Transform(({ value }) => {
    return value.map(({ student }) => student);
  })
  students?: Array<{
    student: {
      id: string;
      first_name: string;
      last_name?: string;
      email: string;
    };
  }>;

  @Exclude()
  password: string;

  @Exclude()
  reset_token: string;

  @Exclude()
  expire_reset_token: Date;

  @Exclude()
  avatar_image: string;

  constructor(partial: Partial<ResponseUserDto>) {
    Object.assign(this, partial);
  }
}
