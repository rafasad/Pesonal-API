import { Test, TestingModule } from '@nestjs/testing';
import { PublicsController } from './publics.controller';
import { PublicsService } from './publics.service';

describe('PublicsController', () => {
  let controller: PublicsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicsController],
      providers: [PublicsService],
    }).compile();

    controller = module.get<PublicsController>(PublicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
