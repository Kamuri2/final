import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Role {
  @Field(() => Int)
  id: number;

  @Field()
  nombre_rol: string; // Ejemplo: 'Administrador', 'Alumno', 'Prefecto'
}