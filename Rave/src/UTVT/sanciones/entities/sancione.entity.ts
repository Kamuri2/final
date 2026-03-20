import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Sancion {
  @Field(() => Int)
  id: number;

  @Field()
  motivo: string;

  @Field()
  bloquea_acceso: boolean;

  @Field(() => Int)
  alumno_id: number;
}