import { Test, TestingModule } from '@nestjs/testing';
import { PasesvisitaResolver } from './pasesvisita.resolver';
import { PasesvisitaService } from './pasesvisita.service';

describe('PasesvisitaResolver', () => {
  let resolver: PasesvisitaResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasesvisitaResolver, PasesvisitaService],
    }).compile();

    resolver = module.get<PasesvisitaResolver>(PasesvisitaResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
