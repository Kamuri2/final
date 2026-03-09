import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreatePuntosAccesoInput } from './create-puntosacceso.input';

@InputType()
export class UpdatePuntosAccesoInput extends PartialType(CreatePuntosAccesoInput) {
  @Field(() => Int) id: number;
}