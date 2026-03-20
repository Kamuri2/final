import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateRegistrosAccesoInput } from './create-registrosacceso.input';

@InputType()
export class UpdateRegistrosAccesoInput extends PartialType(CreateRegistrosAccesoInput) {
  @Field(() => Int)
  id: number; 
}