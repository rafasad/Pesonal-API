import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../../config/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SendMailProducerService } from 'src/jobs/sendMail-producer.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '5000s' }, // Deixar maior em dev para desenvolvimento
    }),
    BullModule.registerQueue({
      name: 'sendMail-queue',
    }),
  ],
  providers: [
    AuthService,
    UsersService,
    PrismaService,
    LocalStrategy,
    JwtStrategy,
    SendMailProducerService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
