import { Module } from '@nestjs/common';
import { CarrerasService } from './carreras.service';
import { CarrerasResolver } from './carreras.resolver';

@Module({
  providers: [CarrerasResolver, CarrerasService],
})
export class CarrerasModule {}
