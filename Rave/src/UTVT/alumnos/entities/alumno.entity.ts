import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Grupo } from '../../grupos/entities/grupo.entity';

@ObjectType()
export class Alumno {
  @Field(() => Int)
  id: number;

  @Field()
  nombre_completo: string;

  @Field()
  matricula: string;

  @Field({ nullable: true }) 
  carrera?: string;

  @Field(() => Int, { nullable: true }) 
  semestre?: number;
 
  @Field(() => Grupo, { nullable: true })
  grupos?: Grupo;

  // 🏫 VITAL: Esto permite que el Home lea el ID del grupo
  @Field(() => Int, { nullable: true })
  grupo_id?: number;

  @Field({ defaultValue: 'ACTIVO' })
  estado_academico: string;

  // 🆔 Relación opcional por si necesitas saber qué usuario le pertenece
  @Field(() => Int, { nullable: true })
  userId?: number;

  
  
}