import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateEmpleadoInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  num_empleado: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  nombre_completo: string;

  @Field(() => Int)
  @IsNotEmpty()
  depto_id: number;
}