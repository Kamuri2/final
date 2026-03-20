import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // CONEXIONES
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    
    const adapter = new PrismaPg(pool);

    
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ El-Piojo: Conexión establecida con éxito');
  }
}