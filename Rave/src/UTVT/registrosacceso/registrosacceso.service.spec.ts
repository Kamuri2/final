import { Test, TestingModule } from '@nestjs/testing';
import { RegistrosAccesoService } from './registrosacceso.service';

describe('RegistrosaccesoService', () => {
  let service: RegistrosAccesoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrosAccesoService],
    }).compile();

    service = module.get<RegistrosAccesoService>(RegistrosAccesoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
