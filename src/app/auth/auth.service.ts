import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { INCLUDE_GENERIC_USER, UsersService } from '../users/users.service';
import { v4 as uuidV4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { addMinutes, isBefore } from 'date-fns';
import { hashSync, compareSync } from 'bcrypt';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendMailProducerService } from 'src/jobs/sendMail-producer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';

const expireTokenTimeInMinutes = process.env.EXPIRE_RESET_PASSWORD_TIME;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private sendMailService: SendMailProducerService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        avatar: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'Email or password invalid',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    if (user.deleted_at !== null) {
      throw new UnauthorizedException({
        message: 'Your user is blocked',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const match = await compareSync(password, user.password);

    if (!match) {
      return null;
    }

    if (user.reset_token) {
      await this.usersService.update(user.id, {
        reset_token: null,
        expire_reset_token: null,
      });
    }

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    delete user.password;

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidV4();

    await this.prisma.userToken.upsert({
      where: { user_id: user.id },
      create: {
        user_id: user.id,
        refresh_token: refreshToken,
        token: accessToken,
      },
      update: {
        refresh_token: refreshToken,
        token: accessToken,
      },
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refreshToken(data: RefreshDto) {
    const { token, refresh_token } = data;

    const userToken = await this.prisma.userToken.findFirst({
      where: {
        AND: [{ token }, { refresh_token }],
      },
    });

    if (!userToken) {
      throw new UnauthorizedException({
        message: 'Refresh token invalid',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const user = await this.usersService.findOne({ id: userToken.user_id });

    const login = await this.login(user);

    return login;
  }

  async getProfile(reqUser: any) {
    const { id } = reqUser;

    const user = await this.usersService.findOne({ id });

    return user;
  }

  async signUp(data: RegisterDto) {
    const { email, first_name, last_name, password, teacher_id } = data;

    const user = await this.prisma.user.create({
      data: {
        email,
        first_name,
        last_name,
        password: hashSync(password, 10) as string,
        teachers: {
          create: {
            teacher_id,
          },
        },
      },
      include: INCLUDE_GENERIC_USER,
    });

    await this.sendMailService.sendMailWelcome({
      name: user.first_name,
      email: user.email,
      teacher: {
        name: user.teachers[0].teacher.first_name,
        email: user.teachers[0].teacher.email,
      },
    });

    return user;
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<any> {
    const { email } = data;
    const user = await this.usersService.findOne({ email });

    if (!user) {
      throw new UnauthorizedException({
        message: 'Email not found',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
    const tokenWithoutHash = uuidV4();

    const token = hashSync(tokenWithoutHash, 10);

    await this.usersService.update(user.id, {
      reset_token: token,
      expire_reset_token: addMinutes(
        new Date(),
        Number(expireTokenTimeInMinutes),
      ),
    });

    this.sendMailService.sendMailForgotPassword({
      name: user.first_name,
      email: user.email,
      token_password: tokenWithoutHash,
    });

    console.log('reset_token', tokenWithoutHash);
  }

  async resetPassword(data: ResetPasswordDto): Promise<any> {
    const { email, reset_token, password } = data;
    const user = await this.usersService.findOne({ email });

    if (!user) {
      throw new UnauthorizedException({
        message: 'Reset Token is invalid',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    if (!isBefore(new Date(), user.expire_reset_token)) {
      throw new UnauthorizedException({
        message: `Token expired after ${expireTokenTimeInMinutes} minutes`,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const match = await compareSync(reset_token, user.reset_token);

    if (!match) {
      throw new UnauthorizedException({
        message: 'Reset Token is invalid',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    await this.usersService.update(user.id, {
      reset_token: null,
      expire_reset_token: null,
      password: password,
    });
  }
}
