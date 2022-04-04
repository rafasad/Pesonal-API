import { ResponseCategoryDto } from './dto/response-category.dto';
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
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from 'src/enums/role.enum';
@Roles(Role.Teacher)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ResponseCategoryDto> {
    return new ResponseCategoryDto(
      await this.categoriesService.create(createCategoryDto),
    );
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(): Promise<Array<ResponseCategoryDto>> {
    return (await this.categoriesService.findAll()).map(
      (_category) => new ResponseCategoryDto(_category),
    );
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseCategoryDto> {
    return new ResponseCategoryDto(
      await this.categoriesService.findOne({ id }),
    );
  }

  @Patch(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponseCategoryDto> {
    return new ResponseCategoryDto(
      await this.categoriesService.update(id, updateCategoryDto),
    );
  }

  @Delete(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ResponseCategoryDto> {
    return new ResponseCategoryDto(await this.categoriesService.remove(id));
  }
}
