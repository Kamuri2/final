import { Test, TestingModule } from '@nestjs/testing';
import { HorariosResolver } from './horarios.resolver';
import { HorariosService } from './horarios.service';

describe('HorariosResolver', () => {
  let resolver: HorariosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HorariosResolver, HorariosService],
    }).compile();

    resolver = module.get<HorariosResolver>(HorariosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
