import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateAlumnoInput {
  @Field()
  matricula: string;

  @Field()
  nombre_completo: string; // 🚀 Asegúrate de que este nombre sea igual al del schema

  @Field(() => Int)
  grupo_id: number; // 💡 Nota: Cambiamos 'id_grupo' por 'grupo_id' para que coincida con Prisma

  @Field()
  estado_academico: string;
}