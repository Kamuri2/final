import { Module } from '@nestjs/common';
import { PasesVisitaService } from './pasesvisita.service';
import { PasesVisitaResolver } from './pasesvisita.resolver';

@Module({
  providers: [PasesVisitaResolver, PasesVisitaService],
})
export class PasesVisitaModule {}
