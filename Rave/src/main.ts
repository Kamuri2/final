import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛡️ CONFIGURACIÓN CORS TOTAL
  // Esto soluciona el problema de que no aparezcan los requests en web
  app.enableCors({
    origin: true, // Permite que tu App (web o móvil) se conecte
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With', // Cabeceras necesarias para GraphQL
  });

  // Validación de datos global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 🚀 Escuchar en 0.0.0.0 es vital para que el celular vea a la Machenike
  await app.listen(3000, '0.0.0.0'); 

  console.log(`--- RAVEN ID BACKEND ---`);
  console.log(`🚀 Servidor corriendo en puerto 3000`);
  console.log(`🔗 Local: http://localhost:3000/graphql`);
  console.log(`📶 Red: http://0.0.0.0:3000/graphql`);
}
bootstrap();