import { Test, TestingModule } from '@nestjs/testing';
import { DepartamentosResolver } from './departamentos.resolver';
import { DepartamentosService } from './departamentos.service';

describe('DepartamentosResolver', () => {
  let resolver: DepartamentosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartamentosResolver, DepartamentosService],
    }).compile();

    resolver = module.get<DepartamentosResolver>(DepartamentosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
