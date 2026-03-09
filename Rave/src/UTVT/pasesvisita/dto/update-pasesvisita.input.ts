import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreatePaseVisitaInput } from './create-pasesvisita.input';

@InputType()
export class UpdatePasesVisitaInput extends PartialType(CreatePaseVisitaInput) {
  @Field(() => Int)
  id: number;
}