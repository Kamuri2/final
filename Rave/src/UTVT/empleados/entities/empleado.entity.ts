import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Departamento } from '../../departamentos/entities/departamento.entity';

@ObjectType()
export class Empleado {
  @Field(() => Int)
  id: number;

  @Field()
  num_empleado: string; // 🆔 Su identificador laboral único

  @Field()
  nombre_completo: string;

  @Field(() => Int)
  depto_id: number;

  @Field(() => Departamento, { nullable: true })
  departamentos?: Departamento;
}