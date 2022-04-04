import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class isUserEmailNotExistsConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async validate(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user ? false : true;
  }

  defaultMessage(): string {
    return `E-mail is already in use`;
  }
}

export function IsUserEmailNotExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsUserEmailNotExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: isUserEmailNotExistsConstraint,
    });
  };
}
