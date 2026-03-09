import { Test, TestingModule } from '@nestjs/testing';
import { CarrerasResolver } from './carreras.resolver';
import { CarrerasService } from './carreras.service';

describe('CarrerasResolver', () => {
  let resolver: CarrerasResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarrerasResolver, CarrerasService],
    }).compile();

    resolver = module.get<CarrerasResolver>(CarrerasResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
