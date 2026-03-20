import { Test, TestingModule } from '@nestjs/testing';
import { PasesVisitaResolver } from './pasesvisita.resolver';
import { PasesVisitaService } from './pasesvisita.service';

describe('PasesVisitaResolver', () => {
  let resolver: PasesVisitaResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasesVisitaResolver, PasesVisitaService],
    }).compile();

    resolver = module.get<PasesVisitaResolver>(PasesVisitaResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
