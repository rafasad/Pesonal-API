import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { P2002, unknown } from 'src/helpers/error-prisma.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export const INCLUDE_GENERIC_CATEGORY = {
  _count: {
    select: { exercises_categories: true },
  },
};
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCategoryDto) {
    try {
      const newCategory = await this.prisma.category.create({
        data,
        include: INCLUDE_GENERIC_CATEGORY,
      });
      return newCategory;
    } catch (e) {
      P2002('Category', e, data);
      unknown(e);
    }
  }

  findAll() {
    return this.prisma.category.findMany({
      include: INCLUDE_GENERIC_CATEGORY,
    });
  }

  async findOne(args: Prisma.CategoryWhereUniqueInput) {
    const category = await this.prisma.category.findUnique({
      where: args,
      include: INCLUDE_GENERIC_CATEGORY,
    });

    if (!category) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'Category not founded',
      });
    }

    return category;
  }

  async update(id: string, data: UpdateCategoryDto) {
    await this.findOne({ id });
    try {
      const updateCategory = await this.prisma.category.update({
        where: { id },
        data,
        include: INCLUDE_GENERIC_CATEGORY,
      });
      return updateCategory;
    } catch (e) {
      P2002('Category', e, data);
      unknown(e);
    }
  }

  async remove(id: string) {
    await this.findOne({ id });

    return await this.prisma.category.delete({
      where: { id },
      include: INCLUDE_GENERIC_CATEGORY,
    });
  }
}
