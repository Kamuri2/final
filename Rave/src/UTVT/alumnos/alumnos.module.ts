import { Module } from '@nestjs/common';
import { AlumnosService } from './alumnos.service';
import { AlumnosResolver } from './alumnos.resolver';

@Module({
  providers: [AlumnosResolver, AlumnosService],
})
export class AlumnosModule {}
