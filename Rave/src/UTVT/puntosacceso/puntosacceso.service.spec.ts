import { Test, TestingModule } from '@nestjs/testing';
import { PuntosAccesoService } from './puntosacceso.service';

describe('PuntosAccesoService', () => {
  let service: PuntosAccesoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuntosAccesoService],
    }).compile();

    service = module.get<PuntosAccesoService>(PuntosAccesoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
