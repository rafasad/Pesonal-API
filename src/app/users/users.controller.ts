import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  ParseUUIDPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/helpers/image-upload.helper';
import { P2002, unknown } from 'src/helpers/error-prisma.helper';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ResponseUserDto } from './dto/response-user.dto';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles(Role.Admin)
  @Post('users')
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    try {
      return new ResponseUserDto(await this.usersService.create(createUserDto));
    } catch (e) {
      unknown(e);
    }
  }

  @Roles(Role.Admin)
  @Get('users')
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(): Promise<Array<ResponseUserDto>> {
    return (await this.usersService.findAll()).map(
      (user) => new ResponseUserDto(user),
    );
  }

  @Roles(Role.Admin)
  @Get('users/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseUserDto> {
    return new ResponseUserDto(await this.usersService.findOne({ id: id }));
  }

  @Roles(Role.Admin)
  @Patch('users/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    try {
      return new ResponseUserDto(
        await this.usersService.update(id, updateUserDto),
      );
    } catch (e) {
      P2002('User', e, updateUserDto);
      unknown(e);
    }
  }

  @Roles(Role.Admin)
  @Delete('users/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseUserDto> {
    return new ResponseUserDto(await this.usersService.remove(id));
  }

  @Roles(Role.Admin)
  @Get('users/recover/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async recover(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseUserDto> {
    return new ResponseUserDto(await this.usersService.recover(id));
  }

  @Roles(Role.User)
  @Post('users/profile-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  uploadFile(@UploadedFile() image: Express.Multer.File, @Req() req: any) {
    return this.usersService.saveProfileImageDatabase(image, req.user.id);
  }

  @Roles(Role.Admin)
  @Post('users/avatar/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
    ClassSerializerInterceptor,
  )
  async uploadUserAvatar(
    @UploadedFile() image: Express.Multer.File,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseUserDto> {
    return new ResponseUserDto(
      await this.usersService.saveProfileImageDatabase(image, id),
    );
  }

  @Roles(Role.Admin)
  @Delete('users/avatar/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async deleteUserAvatar(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseUserDto> {
    return new ResponseUserDto(
      await this.usersService.deleteProfileImageDatabase(id),
    );
  }

  @Roles(Role.User)
  @Patch('profile')
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    try {
      const profile = await this.usersService.update(
        req.user.id,
        updateProfileDto,
      );

      delete profile.password;

      return profile;
    } catch (e) {
      P2002('User', e, updateProfileDto);
      unknown(e);
    }
  }

  @Roles(Role.User)
  @Patch('profile-password')
  async updatePassword(
    @Req() req: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.usersService.updatePassword(
      req.user.id,
      updatePasswordDto,
    );
  }
}
