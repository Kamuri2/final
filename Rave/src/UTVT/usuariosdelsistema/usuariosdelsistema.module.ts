import { Module } from '@nestjs/common';
import { UsuarioSistemaService } from './usuariosdelsistema.service';
import { UsuariosSistemaResolver } from './usuariosdelsistema.resolver';

@Module({
  providers: [UsuariosSistemaResolver, UsuarioSistemaService],
})
export class UsuariosdelsistemaModule {}
