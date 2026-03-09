import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Alumno {
  @Field(() => Int)
  id: number;

  @Field()
  matricula: string;

  @Field()
  nombre_completo: string;

  @Field(() => Int)
  grupo_id: number;

  @Field()
  estado_academico: string;
}