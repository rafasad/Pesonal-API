import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ExercisesController],
  providers: [PrismaService, ExercisesService],
})
export class ExercisesModule {}
