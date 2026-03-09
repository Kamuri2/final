import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePuntosAccesoInput {
  @Field() ubicacion: string;
  @Field() tipo: string;
}