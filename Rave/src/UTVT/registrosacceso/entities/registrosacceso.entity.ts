import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class RegistroAcceso {
  @Field(() => Int)
  id: number;

  @Field()
  fecha_hora: Date;

  @Field()
  concedido: boolean; // ✅ / ❌

  @Field({ nullable: true })
  motivo_rechazo?: string;

  @Field(() => Int)
  punto_id: number;

  @Field(() => Int)
  usuario_id: number;
}