import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Esto hace que no tengas que importarlo en cada módulo
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}