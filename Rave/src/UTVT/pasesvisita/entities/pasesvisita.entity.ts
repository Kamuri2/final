import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Visitante } from '../../visitantes/entities/visitante.entity';

@ObjectType()
export class PaseVisita {
  @Field(() => Int)
  id: number;

  @Field()
  qr_hash: string;

  @Field()
  expiracion: Date; // ⏱importante para accesos temporales

  @Field(() => Int)
  visitante_id: number;

  @Field(() => Int)
  autoriza_id: number; // ID del administrador que dio el permiso

  @Field(() => Visitante, { nullable: true })
  visitantes?: Visitante;
}