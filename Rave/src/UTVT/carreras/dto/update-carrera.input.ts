import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateCarreraInput } from './create-carrera.input';

@InputType()
export class UpdateCarreraInput extends PartialType(CreateCarreraInput) {
  @Field(() => Int)
  id: number;
}