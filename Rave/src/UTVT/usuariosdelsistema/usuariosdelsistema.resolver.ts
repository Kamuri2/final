import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UsuarioSistemaService } from './usuariosdelsistema.service';
import { UsuarioSistema } from './entities/usuariosdelsistema.entity';
import { CreateUsuarioSistemaInput } from './dto/create-usuariosdelsistema.input';
import { UpdateUsuariosSistemaInput } from './dto/update-usuariosdelsistema.input';

// 1. Definimos la estructura de lo que recibirá React al iniciar sesión
@ObjectType()
class LoginResponse {
  @Field()
  token: string;

  @Field()
  rol: string;
}

@Resolver(() => UsuarioSistema)
export class UsuariosSistemaResolver {
  constructor(private readonly usuariosService: UsuarioSistemaService) {}

  // 🚀 LA MUTACIÓN CLAVE: Esta es la que busca tu frontend
  @Mutation(() => LoginResponse)
  async loginUsuario(
    @Args('username') username: string,
    @Args('password') password: string,
  ) {
    return this.usuariosService.loginUsuario(username, password);
  }

  @Mutation(() => UsuarioSistema)
  createUsuariosSistema(@Args('createUsuariosSistemaInput') createInput: CreateUsuarioSistemaInput) {
    return this.usuariosService.create(createInput);
  }

  @Query(() => [UsuarioSistema], { name: 'usuarios' })
  findAll() {
    return this.usuariosService.findAll();
  }

  @Query(() => UsuarioSistema, { name: 'usuario', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Mutation(() => UsuarioSistema)
  updateUsuariosSistema(@Args('updateUsuariosSistemaInput') updateInput: UpdateUsuariosSistemaInput) {
    return this.usuariosService.update(updateInput.id_usuario, updateInput);
  }

  @Mutation(() => UsuarioSistema)
  removeUsuariosSistema(@Args('id', { type: () => Int }) id: number) {
    return this.usuariosService.remove(id);
  }
}