import { Test, TestingModule } from '@nestjs/testing';
import { VisitantesService } from './visitantes.service';

describe('VisitantesService', () => {
  let service: VisitantesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisitantesService],
    }).compile();

    service = module.get<VisitantesService>(VisitantesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
