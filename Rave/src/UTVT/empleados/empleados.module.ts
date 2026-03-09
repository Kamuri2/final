import { Module } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { EmpleadosResolver } from './empleados.resolver';

@Module({
  providers: [EmpleadosResolver, EmpleadosService],
})
export class EmpleadosModule {}
