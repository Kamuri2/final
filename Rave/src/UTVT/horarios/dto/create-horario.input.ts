import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateHorarioInput {
  @Field()
  @IsNotEmpty()
  dia_semana: string;

  @Field()
  @IsNotEmpty()
  hora_entrada: Date;

  @Field()
  @IsNotEmpty()
  hora_salida: Date;

  @Field(() => Int)
  @IsNotEmpty()
  grupo_id: number;
}