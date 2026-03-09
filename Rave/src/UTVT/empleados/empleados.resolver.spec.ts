import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadosResolver } from './empleados.resolver';
import { EmpleadosService } from './empleados.service';

describe('EmpleadosResolver', () => {
  let resolver: EmpleadosResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmpleadosResolver, EmpleadosService],
    }).compile();

    resolver = module.get<EmpleadosResolver>(EmpleadosResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
