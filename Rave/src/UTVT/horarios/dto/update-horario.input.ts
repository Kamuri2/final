import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateHorarioInput } from './create-horario.input';

@InputType()
export class UpdateHorarioInput extends PartialType(CreateHorarioInput) {
  @Field(() => Int)
  id: number;
}