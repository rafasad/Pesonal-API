import { Module } from '@nestjs/common';
import { PublicsService } from './publics.service';
import { PublicsController } from './publics.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PublicsController],
  providers: [PublicsService, PrismaService],
})
export class PublicsModule {}
