import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 🚀 1. Creamos la piscina de conexiones usando tu URL
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 🚀 2. Creamos el adaptador que Prisma 7 exige
    const adapter = new PrismaPg(pool);

    // 🚀 3. Se lo pasamos al constructor para que desaparezca el error de la imagen 2d7000
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ El-Piojo: Conexión establecida con éxito');
  }
}