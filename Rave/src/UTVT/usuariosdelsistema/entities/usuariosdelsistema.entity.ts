import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Alumno } from '../../alumnos/entities/alumno.entity'; // 👈 Importamos la entidad Alumno

@ObjectType()
export class UsuarioSistema {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  @Field(() => Boolean)
  registro_completo: boolean;

  // 🆔 Guardamos el ID del vínculo por si lo necesitas
  @Field(() => Int, { nullable: true })
  alumno_id?: number;

  // 🛡️ RELACIÓN REAL: 
  // A través de este objeto "alumnos", tu app podrá leer:
  // usuario.alumnos.carrera, usuario.alumnos.semestre, etc.
  @Field(() => Alumno, { nullable: true })
  alumnos?: Alumno; 

  // ⚠️ NOTA: Los campos carrera, semestre y matricula NO van aquí.
  // Van dentro de la entidad 'Alumno'. 
}