import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  isUUID,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class isModelIdExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(id: string | Array<string>, args: any) {
    const model = this.prisma[args.constraints[0]];
    if (model === undefined) {
      throw new InternalServerErrorException(
        `The model '${args.constraints[0]}' is undefined (isModelIdExists)`,
      );
    }
    const ids = id instanceof Array && args.constraints[2] ? id : [id];

    const inWhere = [];
    ids.forEach((uuid) => {
      if (isUUID(uuid)) {
        inWhere.push(uuid);
      }
    });

    if (inWhere.length !== ids.length) {
      return false;
    }

    const select = await model.findMany({
      where: {
        id: { in: inWhere },
      },
    });

    return select.length === ids.length ? true : false;
  }

  defaultMessage(args: any): string {
    return `$property ${
      args.constraints[1] ?? args.constraints[0]
    } not founded`;
  }
}

export function isModelIdExists(
  model: string,
  modelMessage?: string,
  isArray?: boolean,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isModelIdExists',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [model, modelMessage, isArray],
      options: validationOptions,
      validator: isModelIdExistsConstraint,
    });
  };
}
