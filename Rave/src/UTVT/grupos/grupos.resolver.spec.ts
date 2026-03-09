import { Test, TestingModule } from '@nestjs/testing';
import { GruposResolver } from './grupos.resolver';
import { GruposService } from './grupos.service';

describe('GruposResolver', () => {
  let resolver: GruposResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GruposResolver, GruposService],
    }).compile();

    resolver = module.get<GruposResolver>(GruposResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
