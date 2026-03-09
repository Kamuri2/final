import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateDepartamentoInput {
  @Field()
  nombre_depto: string;
}