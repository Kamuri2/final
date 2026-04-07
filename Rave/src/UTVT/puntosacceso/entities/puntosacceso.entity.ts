import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PuntoAcceso {
  @Field(() => Int)
  id: number;

  @Field()
  ubicacion: string;

  @Field()
  tipo: string; 

  @Field()
  nombre: string;
}