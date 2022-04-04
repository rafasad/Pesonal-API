import { Prisma } from '@prisma/client';
import { BadRequestException, HttpStatus } from '@nestjs/common';

export const unknown = (e: string) => {
  throw new Error(e);
};

export const P2002 = (
  model: string,
  e: Prisma.PrismaClientKnownRequestError,
  data: any,
) => {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    throw new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      fields: {
        [e.meta?.['target'][0]]: `${model} ${e.meta?.['target'][0]} '${
          data[e.meta?.['target'][0]]
        }' already used`,
      },
      error: 'Bad Request',
    });
  }
};
