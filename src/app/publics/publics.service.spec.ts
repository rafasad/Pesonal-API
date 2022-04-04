import { Test, TestingModule } from '@nestjs/testing';
import { PublicsService } from './publics.service';

describe('PublicsService', () => {
  let service: PublicsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicsService],
    }).compile();

    service = module.get<PublicsService>(PublicsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
