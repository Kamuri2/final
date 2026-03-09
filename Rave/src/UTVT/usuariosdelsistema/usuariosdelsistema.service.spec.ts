import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosSistemaService } from './usuariosdelsistema.service';

describe('UsuariosSistemaService', () => {
  let service: UsuariosSistemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosSistemaService],
    }).compile();

    service = module.get<UsuariosSistemaService>(UsuariosSistemaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
