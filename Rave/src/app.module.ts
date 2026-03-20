import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config'; 
import { join } from 'path';

// Importaciones de tus módulos UTVT
import { CarrerasModule } from './UTVT/carreras/carreras.module';
import { GruposModule } from './UTVT/grupos/grupos.module';
import { DepartamentoModule } from './UTVT/departamentos/departamentos.module';
import { HorariosModule } from './UTVT/horarios/horarios.module';
import { AlumnosModule } from './UTVT/alumnos/alumnos.module';
import { EmpleadosModule } from './UTVT/empleados/empleados.module';
import { VisitantesModule } from './UTVT/visitantes/visitantes.module';
import { RolesModule } from './UTVT/roles/roles.module';
import { SancionesModule } from './UTVT/sanciones/sanciones.module';
import { CredencialesModule } from './UTVT/credenciales/credenciales.module';
import { UsuariosSistemaModule } from './UTVT/usuariosdelsistema/usuariosdelsistema.module';
import { PuntosAccesoModule } from './UTVT/puntosacceso/puntosacceso.module';
import { PasesVisitaModule } from './UTVT/pasesvisita/pasesvisita.module';
import { RegistrosaccesoModule } from './UTVT/registrosacceso/registrosacceso.module';
import { PrismaModule } from './UTVT/prisma/prisma.module';

@Module({
  imports: [
    //ConfigModule debe ir aquí, al mismo nivel que los demás
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    // GraphQLModule ahora tiene solo su configuración
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true, 
    }),

    // módulos de lógica
    PrismaModule,
    CarrerasModule,
    GruposModule,
    DepartamentoModule,
    HorariosModule,
    AlumnosModule,
    EmpleadosModule,
    VisitantesModule,
    RolesModule,
    SancionesModule,
    CredencialesModule,
    UsuariosSistemaModule,
    PuntosAccesoModule,
    PasesVisitaModule,
    RegistrosaccesoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}