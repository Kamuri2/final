import { Module } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { HorariosResolver } from './horarios.resolver';

@Module({
  providers: [HorariosResolver, HorariosService],
})
export class HorariosModule {}
