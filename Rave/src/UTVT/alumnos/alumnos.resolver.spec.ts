import { Test, TestingModule } from '@nestjs/testing';
import { AlumnosResolver } from './alumnos.resolver';
import { AlumnosService } from './alumnos.service';

describe('AlumnosResolver', () => {
  let resolver: AlumnosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlumnosResolver, AlumnosService],
    }).compile();

    resolver = module.get<AlumnosResolver>(AlumnosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
