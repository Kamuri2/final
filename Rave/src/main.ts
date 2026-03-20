import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuramos CORS para permitir solicitudes desde el frontend
  app.enableCors({
    origin: ['http://localhost:8081', 'http://localhost:5173'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Mantenemos la validación global de datos
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
  
  // Agregamos un mensaje de consola para confirmar que el backend se ha iniciado correctamente
  console.log('\n--------------------------------------------------');
  console.log('Backend "RavenID" iniciado exitosamente');
  console.log('Endpoint GraphQL: http://localhost:3000/graphql');
  console.log('--------------------------------------------------\n');
}
bootstrap();