import { Module } from '@nestjs/common';
import { SancionesService } from './sanciones.service';
import { SancionesResolver } from './sanciones.resolver';

@Module({
  providers: [SancionesResolver, SancionesService],
})
export class SancionesModule {}
