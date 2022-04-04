import {
  BadRequestException,
  HttpStatus,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.reduce((acc, error) => {
          const errorMessages = Object.values(error.constraints);
          let message = errorMessages[0] ?? '';
          if (error.property === message.substr(0, error.property.length)) {
            const firstLetter = message.substr(error.property.length + 1, 1);
            message =
              firstLetter.toUpperCase() +
              message.substring(error.property.length + 2);
          }
          return { ...acc, [error.property]: message };
        }, {});
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          fields: messages,
          error: 'Bad Request',
        });
      },
    }),
  );
  // It allows class-validator to use NestJS dependency injection container
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(3001);
}
bootstrap();
