import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Alumno } from '../../alumnos/entities/alumno.entity';
// Importa la entidad de Empleado si ya la tienes, si no, déjala como comentario
// import { Empleado } from '../../empleados/entities/empleado.entity'; 

@ObjectType()
export class Credenciale {
  @Field(() => Int)
  id: number;
  @Field(() => Int) //  Nuevo 
  usuario_id: number;
  @Field()
  qr_hash: string; // Hash encriptado 

  @Field(() => Date) // MPORTANTE: Forzamos que GraphQL lo trate como fecha con hora
  vencimiento: Date;

  @Field()
  estado: string; // 'ACTIVA', 'EXPIRADA', 'BLOQUEADA'

  @Field(() => Int, { nullable: true })
  alumno_id?: number;

  @Field(() => Int, { nullable: true })
  empleado_id?: number; // Agregamos esto para que coincida con Prisma

  @Field(() => Alumno, { nullable: true })
  alumnos?: Alumno; 

  // @Field(() => Empleado, { nullable: true })
  // empleados?: Empleado;
}