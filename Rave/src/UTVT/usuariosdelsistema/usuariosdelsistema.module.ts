import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UsuarioSistemaService } from './usuariosdelsistema.service';
import { UsuariosSistemaResolver } from './usuariosdelsistema.resolver';


@Module({
  imports: [
    // Registramos el módulo con una clave secreta
    JwtModule.register({
      secret: 'RAVEN_ID_CLAVE_SUPER_SECRETA_123', // OJO: En producción, esto debe ir en un archivo .env
      signOptions: { expiresIn: '8h' }, // El token caducará en 8 horas
    }),
  ],
  providers: [UsuariosSistemaResolver, UsuarioSistemaService],
})
export class UsuariosSistemaModule {}