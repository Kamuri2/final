import { Test, TestingModule } from '@nestjs/testing';
import { CredencialesService } from './credenciales.service';

describe('CredencialesService', () => {
  let service: CredencialesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CredencialesService],
    }).compile();

    service = module.get<CredencialesService>(CredencialesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
