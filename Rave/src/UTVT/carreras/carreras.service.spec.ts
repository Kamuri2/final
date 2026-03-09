import { Test, TestingModule } from '@nestjs/testing';
import { CarrerasService } from './carreras.service';

describe('CarrerasService', () => {
  let service: CarrerasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarrerasService],
    }).compile();

    service = module.get<CarrerasService>(CarrerasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
