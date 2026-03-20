import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioSistemaService } from './usuariosdelsistema.service';

describe('UsuarioSistemaService', () => {
  let service: UsuarioSistemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuarioSistemaService],
    }).compile();

    service = module.get<UsuarioSistemaService>(UsuarioSistemaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
