import { Module } from '@nestjs/common';
import { CredencialesService } from './credenciales.service';
import { CredencialesResolver } from './credenciales.resolver';

@Module({
  providers: [CredencialesResolver, CredencialesService],
})
export class CredencialesModule {}
