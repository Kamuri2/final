import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateVisitanteInput {
  @Field()
  nombre_completo: string;

  @Field()
  identificacion: string;

  @Field()
  motivo: string;
}