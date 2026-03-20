import { Test, TestingModule } from '@nestjs/testing';
import { PuntosAccesoResolver } from './puntosacceso.resolver';
import { PuntosAccesoService } from './puntosacceso.service';

describe('PuntosAccesoResolver', () => {
  let resolver: PuntosAccesoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuntosAccesoResolver, PuntosAccesoService],
    }).compile();

    resolver = module.get<PuntosAccesoResolver>(PuntosAccesoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
