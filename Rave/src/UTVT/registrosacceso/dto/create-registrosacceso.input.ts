import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateRegistrosAccesoInput {
  @Field() fecha_hora: Date;
  @Field(() => Boolean) concedido: boolean;
  @Field({ nullable: true }) motivo_rechazo?: string;
  @Field(() => Int) punto_id: number;
  @Field(() => Int) usuario_id: number;
  @Field(() => Int, { nullable: true }) credencial_id?: number;
  @Field(() => Int, { nullable: true }) pase_id?: number;
}