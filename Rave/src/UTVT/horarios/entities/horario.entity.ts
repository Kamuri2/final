import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Horario {
  @Field(() => Int)
  id: number;

  @Field()
  dia_semana: string; 

  @Field()
  hora_entrada: Date; 

  @Field()
  hora_salida: Date;

  @Field(() => Int)
  grupo_id: number;
}