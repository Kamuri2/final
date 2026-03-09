import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateSancionInput {
  @Field()
  motivo: string;

  @Field(() => Boolean)
  bloquea_acceso: boolean;

  @Field(() => Int)
  alumno_id: number;
}