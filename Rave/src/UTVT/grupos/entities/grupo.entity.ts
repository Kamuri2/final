import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Carrera } from '../../carreras/entities/carrera.entity';

@ObjectType()
export class Grupo {
  @Field(() => Int)
  id: number;

  @Field()
  nombre: string; // Ejemplo: 'GDS0542'

  @Field(() => Int)
  semestre: number;

  @Field(() => Int)
  carrera_id: number;

  @Field(() => Carrera, { nullable: true })
  carreras?: Carrera; // Relación para ver a qué carrera pertenece
}