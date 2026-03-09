import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Sancion {
  @Field(() => Int)
  id: number;

  @Field()
  motivo: string;

  @Field()
  bloquea_acceso: boolean; // 🚫 La variable booleana que detiene el acceso

  @Field(() => Int)
  alumno_id: number;
}