import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateCarreraInput {
  @Field()
  @IsNotEmpty({ message: 'El nombre de la carrera es necesario' })
  @IsString()
  nombre: string;

  @Field()
  @IsNotEmpty({ message: 'La clave de la carrera es obligatoria' })
  @MaxLength(20)
  clave: string;
}