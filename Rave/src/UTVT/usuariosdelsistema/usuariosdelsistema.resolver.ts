import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UsuarioSistemaService } from './usuariosdelsistema.service';
import { UsuarioSistema } from './entities/usuariosdelsistema.entity';
import { CreateUsuarioSistemaInput } from './dto/create-usuariosdelsistema.input';
import { UpdateUsuariosSistemaInput } from './dto/update-usuariosdelsistema.input'; // 👈 EL IMPORT QUE FALTABA
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);

@ObjectType()
class LoginResponse {
  @Field()
  token: string;

  @Field()
  rol: string;

  @Field(() => Int)
  id: number;
}

@Resolver(() => UsuarioSistema)
export class UsuariosSistemaResolver {
  constructor(private readonly usuariosService: UsuarioSistemaService) {}

  // 1. LOGIN (Público)
  @Public()
  @Mutation(() => LoginResponse)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<LoginResponse> {
    return this.usuariosService.loginUsuario(username, password);
  }

  // 2. REGISTRO INICIAL (Público)
  @Public()
  @Mutation(() => UsuarioSistema)
  async registrarAlumno(
    @Args('input') input: CreateUsuarioSistemaInput
  ) {
    return this.usuariosService.create(input);
  }

  // 3. ACTUALIZACIÓN DE FICHA / FORMULARIO (Real)
  // Nota: Si usas seguridad JWT, quita el @Public(). 
  // Si aún estás probando sin tokens, déjalo puesto.
  @Public() 
  @Mutation(() => UsuarioSistema)
  async actualizarAlumno(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUsuariosSistemaInput,
  ) {
    return this.usuariosService.update(id, input);
  }

  // En el servidor NestJS (Machenike)
@Query(() => UsuarioSistema, { name: 'getUsuarioStatus' }) // 👈 EL NOMBRE TIENE QUE SER ESTE
findOne(@Args('id', { type: () => Int }) id: number) {
  return this.usuariosService.findOne(id);
}
}

