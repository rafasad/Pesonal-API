import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { existsSync } from 'fs';

//import { PublicsService } from './publics.service';

@Controller('api')
export class PublicsController {
  //constructor(private publicsService: PublicsService) {}

  @Get('avatar/:imageName')
  async avatar(@Param('imageName') imageName, @Res() res): Promise<any> {
    const exist = existsSync(`uploads/images/${imageName}`);

    if (exist) {
      return res.sendFile(imageName, { root: 'uploads/images' });
    }

    throw new NotFoundException({
      message: 'Image not found',
      statusCode: HttpStatus.NOT_FOUND,
    });
  }
}
