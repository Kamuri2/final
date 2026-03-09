import { Test, TestingModule } from '@nestjs/testing';
import { PasesVisitaService } from './pasesvisita.service';

describe('PasesVisitaService', () => {
  let service: PasesVisitaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasesVisitaService],
    }).compile();

    service = module.get<PasesVisitaService>(PasesVisitaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
