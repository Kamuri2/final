import { Module } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { GruposResolver } from './grupos.resolver';

@Module({
  providers: [GruposResolver, GruposService],
})
export class GruposModule {}
