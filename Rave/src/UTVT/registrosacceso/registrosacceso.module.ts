import { Module } from '@nestjs/common';
import { RegistrosAccesoService } from './registrosacceso.service';
import { RegistrosAccesoResolver } from './registrosacceso.resolver';

@Module({
  providers: [RegistrosAccesoResolver, RegistrosAccesoService],
})
export class RegistrosaccesoModule {}
