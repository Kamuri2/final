import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreatePaseVisitaInput {
  @Field()
  qr_hash: string;

  @Field()
  expiracion: Date;

  @Field(() => Int)
  visitante_id: number;

  @Field(() => Int)
  autoriza_id: number;
}