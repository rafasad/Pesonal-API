import {
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  // ParseUUIDPipe,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hashSync, compareSync } from 'bcrypt';
import { FileImage, getImageExtension } from 'src/helpers/image-upload.helper';
import { unlink } from 'fs/promises';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserDto } from './dto/user.dto';

export const INCLUDE_GENERIC_USER = {
  avatar: {
    select: {
      name: true,
      path: true,
    },
  },
  students: {
    select: {
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  },
  teachers: {
    select: {
      teacher: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  },
};
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: CreateUserDto) {
    return await this.prisma.user.create({
      data: {
        ...data,
        ...(data.password && {
          password: hashSync(data.password, 10) as string,
        }),
        ...(data.roles && {
          roles: data.roles.sort(),
        }),
      },
      include: INCLUDE_GENERIC_USER,
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: INCLUDE_GENERIC_USER,
      orderBy: [{ first_name: 'asc' }, { last_name: 'asc' }],
    });
  }

  async findOne(args: Prisma.UserWhereUniqueInput) {
    const user = await this.prisma.user.findUnique({
      where: args,
      include: INCLUDE_GENERIC_USER,
    });

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        message: 'User not founded',
      });
    }

    return user;
  }

  async update(id: string, data: UserDto) {
    await this.findOne({ id });

    return await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(data.password && {
          password: hashSync(data.password, 10) as string,
        }),
        ...(data.roles && {
          roles: data.roles.sort(),
        }),
      },
      include: INCLUDE_GENERIC_USER,
    });
  }

  async remove(id: string) {
    await this.findOne({ id });
    return await this.prisma.user.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
      include: INCLUDE_GENERIC_USER,
    });
  }

  async recover(id: string) {
    await this.findOne({ id });
    return await this.prisma.user.update({
      where: { id },
      data: {
        deleted_at: null,
      },
      include: INCLUDE_GENERIC_USER,
    });
  }

  async deleteProfileImageDatabase(userId: string) {
    const user = await this.findOne({ id: userId });

    if (Boolean(user.avatar?.path)) {
      try {
        await unlink(user.avatar.path);
        console.log(`Successfully deleted ${user.avatar?.path}`);
        await this.prisma.image.delete({
          where: { id: user.avatar_image },
        });
      } catch (error) {
        console.error('there was an error:', error.message);
      }
    }
    return await this.findOne({ id: userId });
  }

  async saveProfileImageDatabase(image: FileImage, userId: string) {
    if (image === undefined) {
      throw new NotFoundException({
        message: `Image post not found!`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        avatar: true,
      },
    });
    if (Boolean(user.avatar?.path)) {
      try {
        await unlink(user.avatar.path);
        console.log(`Successfully deleted ${user.avatar?.path}`);
      } catch (error) {
        console.error('there was an error:', error.message);
      }
    }

    const updateOrCreate = user.avatar?.name ? 'update' : 'create';
    const upload = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatar: {
          [updateOrCreate]: {
            original_name: image.originalname,
            name: image.filename,
            type: image.mimetype,
            path: image.path,
            extension: getImageExtension(image.originalname),
          },
        },
      },
      include: INCLUDE_GENERIC_USER,
    });

    delete upload.password;
    return upload;
  }

  async updatePassword(id, data: UpdatePasswordDto) {
    const user = await this.findOne({ id });

    const match = await compareSync(data.last_password, user.password);

    if (!match) {
      throw new NotAcceptableException({
        status: HttpStatus.NOT_ACCEPTABLE,
        message: `Old password doesn't not match`,
      });
    }

    return await this.prisma.user.update({
      where: { id },
      data: { password: data.new_password },
    });
  }
}
