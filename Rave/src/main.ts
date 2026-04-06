process.env.TZ = 'America/Mexico_City';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛡️ CONFIGURACIÓN CORS BLINDADA
  app.enableCors({
    // En producción, solo permite tus dominios de la UTVT
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://fraktalid.utvt.cloud', 'https://web-fraktalid.utvt.cloud'] 
      : true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 🚀 El puerto ahora es inteligente
  const port = process.env.PORT || 3000;
  
  // En producción no siempre es necesario el '0.0.0.0', 
  // pero dejarlo no hace daño en la mayoría de los VPS
  await app.listen(port, '0.0.0.0'); 

  console.log(`--- RAVEN ID BACKEND ---`);
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
  console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();