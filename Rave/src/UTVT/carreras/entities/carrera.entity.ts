import { ObjectType, Field, Int } from '@nestjs/graphql';
// 👈 Importamos el Grupo desde su respectiva carpeta
import { Grupo } from '../../grupos/entities/grupo.entity'; 

@ObjectType()
export class Carrera {
  @Field(() => Int)
  id: number;

  @Field()
  nombre: string;

  @Field()
  clave: string; 

  // 👈 Le decimos a GraphQL que esta carrera trae sus grupos anidados
  @Field(() => [Grupo], { nullable: true })
  grupos?: Grupo[];
}