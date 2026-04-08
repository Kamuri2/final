import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateCredencialeInput } from './create-credenciale.input';

@InputType()
export class UpdateCredencialeInput extends PartialType(CreateCredencialeInput) {
  @Field(() => Int)
  id: number; 

  @Field(() => Int, { nullable: true }) // nullable porque no siempre se actualiza
  usuario_id?: number;

  
}