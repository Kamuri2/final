import { Module } from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';
import { DepartamentosResolver } from './departamentos.resolver';

@Module({
  providers: [DepartamentosResolver, DepartamentosService],
})
export class DepartamentoModule {}