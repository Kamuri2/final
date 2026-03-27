import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Alumno {
  @Field(() => Int)
  id: number;

  @Field()
  matricula: string;
  @Field({ nullable: true }) // 👈 AGREGA ESTO
  carrera?: string;

  @Field(() => Int, { nullable: true }) // 👈 AGREGA ESTO
  semestre?: number;

  @Field()
  nombre_completo: string;

  @Field(() => Int)
  grupo_id: number;

  @Field()
  estado_academico: string;
}