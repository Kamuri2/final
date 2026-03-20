import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Esto hACE QUE SEA GLOBAL
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}