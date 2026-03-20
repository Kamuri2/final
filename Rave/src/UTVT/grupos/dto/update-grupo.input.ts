import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateGrupoInput } from './create-grupo.input';

@InputType()
export class UpdateGrupoInput extends PartialType(CreateGrupoInput) {
  @Field(() => Int)
  id_grupo: number; // Su llave 
}