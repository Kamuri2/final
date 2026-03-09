import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Carrera {
  @Field(() => Int)
  id: number;

  @Field()
  nombre: string;

  @Field()
  clave: string; // Ejemplo: 'TIC-01'
}