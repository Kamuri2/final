import { Resolver, Query, Mutation, Args, Int, ObjectType, Field } from '@nestjs/graphql';
import { UsuarioSistemaService } from './usuariosdelsistema.service';
import { UsuarioSistema } from './entities/usuariosdelsistema.entity';
import { CreateUsuarioSistemaInput } from './dto/create-usuariosdelsistema.input';
import { UpdateUsuarioSistemaInput } from './dto/update-usuariosdelsistema.input'; 
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);

// --- 1. DEFINICIÓN DE TIPOS PARA LA GESTIÓN (Renombrados para evitar conflicto) ---
@ObjectType('GrupoAcad') // 👈 Le damos un nombre único en GraphQL
class GrupoAcad {
  @Field(() => Int) id: number;
  @Field() nombre: string;
}

@ObjectType('CarreraAcad') // 👈 Le damos un nombre único en GraphQL
class CarreraAcad {
  @Field(() => Int) id: number;
  @Field() nombre: string;
  @Field(() => [GrupoAcad], { nullable: 'items' }) grupos: GrupoAcad[];
}

@ObjectType()
class LoginResponse {
  @Field() token: string;
  @Field() rol: string;
  @Field(() => Int) id: number;
}

@Resolver(() => UsuarioSistema)
export class UsuariosSistemaResolver {
  constructor(private readonly usuariosService: UsuarioSistemaService) {}

  // =========================================================================
  // 🏫 SECCIÓN: GESTIÓN ACADÉMICA (CARRERAS Y GRUPOS)
  // =========================================================================

  @Public()
  @Query(() => [CarreraAcad], { name: 'getCarreras' })
  async getCarreras() {
    return this.usuariosService.findAllCarreras();
  }

  @Public()
  @Mutation(() => CarreraAcad, { name: 'createCarrera' })
  async createCarrera(@Args('nombre') nombre: string) {
    return this.usuariosService.createCarrera(nombre);
  }

  @Public()
  @Mutation(() => CarreraAcad, { name: 'deleteCarrera' })
  async deleteCarrera(@Args('id', { type: () => Int }) id: number) {
    return this.usuariosService.removeCarrera(id);
  }

  @Public()
  @Mutation(() => GrupoAcad, { name: 'createGrupo' })
  async createGrupo(
    @Args('nombre') nombre: string,
    @Args('carreraId', { type: () => Int }) carreraId: number,
  ) {
    return this.usuariosService.createGrupo(nombre, carreraId);
  }

  @Public()
  @Mutation(() => GrupoAcad, { name: 'deleteGrupo' })
  async deleteGrupo(@Args('id', { type: () => Int }) id: number) {
    return this.usuariosService.removeGrupo(id);
  }

  // =========================================================================
  // 🔄 SECCIÓN: ACTUALIZACIONES (ADMIN FRONT)
  // =========================================================================

  @Public()
  @Mutation(() => CarreraAcad, { name: 'updateCarrera' })
  async updateCarrera(
    @Args('id', { type: () => Int }) id: number,
    @Args('nombre') nombre: string,
  ) {
    return this.usuariosService.updateCarrera(id, nombre);
  }

  @Public()
  @Mutation(() => GrupoAcad, { name: 'updateGrupo' })
  async updateGrupo(
    @Args('id', { type: () => Int }) id: number,
    @Args('nombre') nombre: string,
  ) {
    return this.usuariosService.updateGrupo(id, nombre);
  } 

  // =========================================================================
  // 🔐 SECCIÓN: AUTENTICACIÓN Y ALUMNOS (YA EXISTENTE)
  // =========================================================================

  @Public()
  @Mutation(() => LoginResponse)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<LoginResponse> {
    return this.usuariosService.loginUsuario(username, password);
  }

  @Public()
  @Mutation(() => UsuarioSistema)
  async registrarAlumno(@Args('input') input: CreateUsuarioSistemaInput) {
    return this.usuariosService.create(input);
  }

  @Public() 
  @Mutation(() => UsuarioSistema)
  async actualizarAlumno(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUsuarioSistemaInput,
  ) {
    return this.usuariosService.update(id, input);
  }

  @Query(() => UsuarioSistema, { name: 'getUsuarioStatus' }) 
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Public()
  @Mutation(() => String, { name: 'solicitarRecuperacionPassword' })
  async solicitarRecuperacionPassword(@Args('email') email: string) {
    return this.usuariosService.solicitarRecuperacion(email);
  }

  @Public()
  @Mutation(() => String, { name: 'resetearPasswordConPin' })
  async resetearPasswordConPin(
    @Args('email') email: string,
    @Args('pin') pin: string,
    @Args('nuevaPassword') nuevaPassword: string
  ) {
    return this.usuariosService.resetearPasswordConPin(email, pin, nuevaPassword);
  }
}