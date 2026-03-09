import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ Ajuste de CORS: Ahora permitimos tanto el puerto 8081 como el 5173
  app.enableCors({
    origin: ['http://localhost:8081', 'http://localhost:5173'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Mantenemos la validación global de datos
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
  
  // Estos mensajes te confirmaron que el backend ya funciona
  console.log('\n--------------------------------------------------');
  console.log('✅ Backend "RavenID" iniciado exitosamente');
  console.log('📍 Endpoint GraphQL: http://localhost:3000/graphql');
  console.log('--------------------------------------------------\n');
}
bootstrap();