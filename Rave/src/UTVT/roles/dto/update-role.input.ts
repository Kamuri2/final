import { CreateRoleInput } from './create-role.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRoleInput extends PartialType(CreateRoleInput) {
  @Field(() => Int)
  id: number; // Aquí sí usamos "id" a secas porque así está en tu diagrama
}