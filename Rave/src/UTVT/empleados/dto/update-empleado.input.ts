import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateEmpleadoInput } from './create-empleado.input';

@InputType()
export class UpdateEmpleadoInput extends PartialType(CreateEmpleadoInput) {
  @Field(() => Int)
  id: number; 
}