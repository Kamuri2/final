import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

@InputType()
export class CreateGrupoInput {
  @Field()
  @IsNotEmpty({ message: 'El nombre del grupo es obligatorio' })
  @IsString()
  nombre: string;

  @Field(() => Int)
  @IsInt()
  @Min(1, { message: 'El semestre debe ser al menos 1' })
  semestre: number;

  @Field(() => Int)
  @IsNotEmpty()
  carrera_id: number; // El ID de la carrera 
}