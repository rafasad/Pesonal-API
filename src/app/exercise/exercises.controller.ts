import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/helpers/image-upload.helper';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseExerciseDto } from './dto/response-exercise.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
@Roles(Role.Teacher)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', null, {
      storage: diskStorage({
        destination: './uploads/execises',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
    ClassSerializerInterceptor,
  )
  async create(
    @Body() createExerciseDto: CreateExerciseDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
  ): Promise<ResponseExerciseDto> {
    return new ResponseExerciseDto(
      await this.exercisesService.create(createExerciseDto, images),
    );
  }

  @Get()
  async findAll() {
    return await this.exercisesService.findAll();
  }

  // @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
  // async findAll(): Promise<Array<ResponseExerciseDto>> {
  //   return (await this.exercisesService.findAll()).map(
  //     (exercise) => new ResponseExerciseDto(exercise),
  //   );
  // }

  @Get(':id')
  @SerializeOptions({
    excludePrefixes: ['_'],
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseExerciseDto> {
    return new ResponseExerciseDto(
      await this.exercisesService.findOne({ id: id }),
    );
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.exercisesService.remove(id);
  }
}
