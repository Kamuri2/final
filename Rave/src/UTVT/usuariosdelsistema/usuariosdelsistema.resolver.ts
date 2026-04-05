import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UsuarioSistemaService } from './usuariosdelsistema.service';
import { UsuarioSistema } from './entities/usuariosdelsistema.entity';
import { CreateUsuarioSistemaInput } from './dto/create-usuariosdelsistema.input';
import { UpdateUsuarioSistemaInput } from './dto/update-usuariosdelsistema.input'; 
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
  @Public() 
  @Mutation(() => UsuarioSistema)
  async actualizarAlumno(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUsuarioSistemaInput,
  ) {
    return this.usuariosService.update(id, input);
  }

  // 4. ESTADO DEL USUARIO (Para el Home)
  @Query(() => UsuarioSistema, { name: 'getUsuarioStatus' }) 
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usuariosService.findOne(id);
  }

  // =========================================================================
  // 🔥 5. RECUPERACIÓN DE CONTRASEÑA (Público)
  // =========================================================================

  @Public()
  @Mutation(() => String, { name: 'solicitarRecuperacionPassword' })
  async solicitarRecuperacionPassword(
    @Args('email', { type: () => String }) email: string
  ) {
    return this.usuariosService.solicitarRecuperacion(email);
  }

  @Public()
  @Mutation(() => String, { name: 'resetearPasswordConPin' })
  async resetearPasswordConPin(
    @Args('email', { type: () => String }) email: string,
    @Args('pin', { type: () => String }) pin: string,
    @Args('nuevaPassword', { type: () => String }) nuevaPassword: string
  ) {
    return this.usuariosService.resetearPasswordConPin(email, pin, nuevaPassword);
  }
}