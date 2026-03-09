import { Module } from '@nestjs/common';
import { VisitantesService } from './visitantes.service';
import { VisitantesResolver } from './visitantes.resolver';

@Module({
  providers: [VisitantesResolver, VisitantesService],
})
export class VisitantesModule {}
