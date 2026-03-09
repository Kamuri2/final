import { Test, TestingModule } from '@nestjs/testing';
import { RegistrosAccesoResolver } from './registrosacceso.resolver';
import { RegistrosAccesoService } from './registrosacceso.service';

describe('RegistrosAccesoResolver', () => {
  let resolver: RegistrosAccesoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrosAccesoResolver, RegistrosAccesoService],
    }).compile();

    resolver = module.get<RegistrosAccesoResolver>(RegistrosAccesoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
