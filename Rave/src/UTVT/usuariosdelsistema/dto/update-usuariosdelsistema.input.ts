import { CreateUsuarioSistemaInput } from './create-usuariosdelsistema.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUsuariosSistemaInput extends PartialType(CreateUsuarioSistemaInput) {
  @Field(() => Int)
  id_usuario: number;
}