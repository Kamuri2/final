import * as dotenv from 'dotenv';
dotenv.config(); // 🚀 Esto carga tu contraseña Kaoriko2 para la terminal

export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};