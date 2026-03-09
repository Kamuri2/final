import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Horario {
  @Field(() => Int)
  id: number;

  @Field()
  dia_semana: string; // Ejemplo: 'Lunes', 'Martes'

  @Field()
  hora_entrada: Date; // ⏱️ @db.Time(6) en tu Postgres

  @Field()
  hora_salida: Date;

  @Field(() => Int)
  grupo_id: number;
}