import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Departamento {
  @Field(() => Int)
  id: number;

  @Field()
  nombre_depto: string;
}