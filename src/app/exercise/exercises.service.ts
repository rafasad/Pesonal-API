import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { unknown } from 'src/helpers/error-prisma.helper';
import { getImageExtension } from 'src/helpers/image-upload.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  selectDefault = {
    id: true,
    name: true,
    description: true,
    video_url: true,
    teacher: {
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    },
    exercises_categories: {
      select: {
        category: {
          select: {
            name: true,
            description: true,
          },
        },
      },
    },
    images: {
      select: {
        name: true,
      },
    },
  };

  async create(data: CreateExerciseDto, images: Array<Express.Multer.File>) {
    const { categories, ...newExercise } = data;
    const categories_connect =
      categories instanceof Array ? categories : categories ? [categories] : [];

    try {
      const exercise = await this.prisma.exercise.create({
        data: {
          ...newExercise,
          images: {
            createMany: {
              data: images.map((image) => ({
                original_name: image.originalname,
                name: image.filename,
                type: image.mimetype,
                path: image.path,
                extension: getImageExtension(image.originalname),
              })),
            },
          },
          exercises_categories: {
            createMany: {
              data: categories_connect.map((category_id) => ({ category_id })),
            },
          },
        },
        select: this.selectDefault,
      });
      return exercise;
    } catch (e) {
      console.log(e);
      unknown(e);
    }
  }

  findAll() {
    return this.prisma.exercise.findMany({
      select: this.selectDefault,
      where: {
        deleted_at: {
          equals: null,
        },
      },
    });
  }

  async findOne(args: Prisma.ExerciseWhereUniqueInput) {
    const exercise = await this.prisma.exercise.findUnique({
      select: { deleted_at: true, ...this.selectDefault },
      where: {
        ...args,
      },
    });

    if (!exercise || exercise.deleted_at !== null) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'Exercise not founded',
      });
    }

    return exercise;
  }

  async update(id: string, data: UpdateExerciseDto) {
    await this.findOne({ id });

    try {
      const updateExercise = await this.prisma.exercise.update({
        where: { id },
        data,
      });
      return updateExercise;
    } catch (e) {
      unknown(e);
    }
  }

  async remove(id: string) {
    await this.findOne({ id });
    return await this.prisma.exercise.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
