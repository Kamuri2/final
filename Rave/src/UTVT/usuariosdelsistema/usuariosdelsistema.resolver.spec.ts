import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosSistemaResolver } from './usuariosdelsistema.resolver';
import { UsuariosSistemaService } from './usuariosdelsistema.service';

describe('UsuariosdelsistemaResolver', () => {
  let resolver: UsuariosSistemaResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosSistemaResolver, UsuariosSistemaService],
    }).compile();

    resolver = module.get<UsuariosSistemaResolver>(UsuariosSistemaResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
