import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PuntoAcceso {
  @Field(() => Int)
  id: number;

  @Field()
  ubicacion: string; // Ejemplo: 'Entrada Principal', 'Biblioteca'

  @Field()
  tipo: string; // Ejemplo: 'Peatonal', 'Vehicular'
}