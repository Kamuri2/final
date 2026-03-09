import { CreateAlumnoInput } from './create-alumno.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAlumnoInput extends PartialType(CreateAlumnoInput) {
  @Field(() => Int)
  id: number; // Es el ID único para saber a quién editamos
}