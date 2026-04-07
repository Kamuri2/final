import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Carrera } from '../../carreras/entities/carrera.entity';

@ObjectType()
export class Grupo {
  @Field(() => Int)
  id: number;

  @Field()
  nombre: string; 

  @Field(() => Int)
  semestre: number;

  @Field(() => Int)
  carrera_id: number;

  @Field(() => Carrera, { nullable: true })
  carreras?: Carrera; // Relación con Carrera para obtener el nombre de la carrera al consultar un grupo
  
}
