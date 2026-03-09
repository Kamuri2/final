import { Module } from '@nestjs/common';
import { PuntosAccesoService } from './puntosacceso.service';
import { PuntosAccesoResolver } from './puntosacceso.resolver';

@Module({
  providers: [PuntosAccesoResolver, PuntosAccesoService],
})
export class PuntosAccesoModule {}
