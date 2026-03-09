import { Test, TestingModule } from '@nestjs/testing';
import { PuntosaccesoResolver } from './puntosacceso.resolver';
import { PuntosaccesoService } from './puntosacceso.service';

describe('PuntosaccesoResolver', () => {
  let resolver: PuntosaccesoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuntosaccesoResolver, PuntosaccesoService],
    }).compile();

    resolver = module.get<PuntosaccesoResolver>(PuntosaccesoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
