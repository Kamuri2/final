import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Role } from '../../roles/entities/role.entity';

@ObjectType()
export class UsuarioSistema {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  @Field(() => Int)
  rol_id: number;

  @Field(() => Role, { nullable: true })
  roles?: Role; // Relación para ver el nombre del rol (ej. 'Administrador')
}