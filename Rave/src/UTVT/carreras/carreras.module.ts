import { Module } from '@nestjs/common';
import { CarrerasService } from './carreras.service';
import { CarrerasResolver } from './carreras.resolver';
import { PrismaService } from '../prisma/prisma.service'; // Importación necesaria

@Module({
  // 🔌 Conectamos el servicio de Prisma para que el Resolver pueda usarlo
  providers: [CarrerasResolver, CarrerasService, PrismaService], 
})
export class CarrerasModule {}