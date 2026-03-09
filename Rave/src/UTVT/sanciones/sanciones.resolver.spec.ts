import { Test, TestingModule } from '@nestjs/testing';
import { SancionesResolver } from './sanciones.resolver';
import { SancionesService } from './sanciones.service';

describe('SancionesResolver', () => {
  let resolver: SancionesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SancionesResolver, SancionesService],
    }).compile();

    resolver = module.get<SancionesResolver>(SancionesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
