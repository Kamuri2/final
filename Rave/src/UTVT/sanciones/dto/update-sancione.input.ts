import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateSancionInput } from './create-sancione.input';

@InputType()
export class UpdateSancionInput extends PartialType(CreateSancionInput) {
  @Field(() => Int)
  id: number; // Su llave primaria
}