import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateRoleInput {
  @Field()
  nombre_rol: string;
}