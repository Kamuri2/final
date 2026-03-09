import { Test, TestingModule } from '@nestjs/testing';
import { VisitantesResolver } from './visitantes.resolver';
import { VisitantesService } from './visitantes.service';

describe('VisitantesResolver', () => {
  let resolver: VisitantesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisitantesResolver, VisitantesService],
    }).compile();

    resolver = module.get<VisitantesResolver>(VisitantesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
