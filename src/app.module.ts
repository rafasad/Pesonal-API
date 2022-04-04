// LIBS
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { APP_INTERCEPTOR, MiddlewareBuilder } from '@nestjs/core';
import { createBullBoard } from 'bull-board';
import { BullAdapter } from 'bull-board/bullAdapter';
import { Queue } from 'bull';

//CONTROLLERS
import { AppController } from './app.controller';

//SERVICES
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

//VALIDATORS
import { isModelIdExistsConstraint } from './validators/model.id.exists.validator';
import { isUserEmailNotExistsConstraint } from './validators/user.email.not-exists.validator';

// CONSUMERS
import { SendMailConsumer } from './jobs/sendMail-consumer';

//INTERCEPTORS
import { HttpFileException } from './interceptors/http-file-exception.interceptor';

// MODULES
import { UsersModule } from './app/users/users.module';
import { ExercisesModule } from './app/exercise/exercises.module';
import { CategoriesModule } from './app/category/categories.module';
import { AuthModule } from './app/auth/auth.module';
import { PublicsModule } from './app/publics/publics.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MulterModule.register({
      dest: './uploads',
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    BullModule.registerQueue({
      name: 'sendMail-queue',
    }),
    UsersModule,
    CategoriesModule,
    ExercisesModule,
    AuthModule,
    PublicsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SendMailConsumer,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpFileException,
    },
    isModelIdExistsConstraint,
    isUserEmailNotExistsConstraint,
  ],
})
export class AppModule {
  constructor(@InjectQueue('sendMail-queue') private queue: Queue) {}

  configure(consumer: MiddlewareBuilder) {
    const { router } = createBullBoard([new BullAdapter(this.queue)]);
    consumer.apply(router).forRoutes('/admin/queues');
  }
}
