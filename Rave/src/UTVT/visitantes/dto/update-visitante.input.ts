import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateVisitanteInput } from './create-visitante.input';

@InputType()
export class UpdateVisitanteInput extends PartialType(CreateVisitanteInput) {
  @Field(() => Int)
  id: number;
}