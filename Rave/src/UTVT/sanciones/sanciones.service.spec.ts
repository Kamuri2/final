import { Test, TestingModule } from '@nestjs/testing';
import { SancionesService } from './sanciones.service';

describe('SancionesService', () => {
  let service: SancionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SancionesService],
    }).compile();

    service = module.get<SancionesService>(SancionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
