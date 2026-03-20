import * as dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    // 🚀 EL TRUCO ESTÁ AQUÍ: -r dotenv/config obliga a cargar las variables
    seed: 'npx ts-node -r dotenv/config prisma/seed.ts',
  },
});