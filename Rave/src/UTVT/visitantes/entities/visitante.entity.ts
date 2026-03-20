import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Visitante {
  @Field(() => Int)
  id: number;

  @Field()
  nombre_completo: string;

  @Field()
  identificacion: string; 

  @Field()
  motivo: string; 
}