import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateCredencialeInput } from './create-credenciale.input';

@InputType()
export class UpdateCredencialeInput extends PartialType(CreateCredencialeInput) {
  @Field(() => Int)
  id: number; 
}