import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateDepartamentoInput } from './create-departamento.input';

@InputType()
export class UpdateDepartamentoInput extends PartialType(CreateDepartamentoInput) {
  @Field(() => Int)
  id: number;
}