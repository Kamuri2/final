import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Visitante {
  @Field(() => Int)
  id: number;

  @Field()
  nombre_completo: string;

  @Field()
  identificacion: string; // Ejemplo: 'INE', 'Pasaporte'

  @Field()
  motivo: string; // Ejemplo: 'Mantenimiento', 'Reunión'
}