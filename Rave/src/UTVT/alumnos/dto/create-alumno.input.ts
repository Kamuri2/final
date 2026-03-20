import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateAlumnoInput {
  @Field()
  matricula: string;

  @Field()
  nombre_completo: string; 

  @Field(() => Int)
  grupo_id: number; 

  @Field()
  estado_academico: string;
}