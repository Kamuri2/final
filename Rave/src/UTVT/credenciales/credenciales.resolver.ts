import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CredencialesService } from './credenciales.service';
import { Credenciale } from './entities/credenciale.entity';
import { CreateCredencialeInput } from './dto/create-credenciale.input';
import { UpdateCredencialeInput } from './dto/update-credenciale.input';

@Resolver(() => Credenciale)
export class CredencialesResolver {
  constructor(private readonly credencialesService: CredencialesService) {}

  // 🔥 MUTATION MAESTRA: Genera 1 solo QR real y borra los viejos en la DB
  @Mutation(() => Credenciale, { name: 'generarCredencial' })
  async generarCredencial(
    @Args('usuarioId', { type: () => Int }) usuarioId: number
  ) {
    // Aquí disparamos la lógica de: Borrar previos -> Crear nuevo -> Devolver Hash
    return await this.credencialesService.generarCredencialReal(usuarioId);
  }

  // 🛡️ CONSULTA PARA EL GUARDIA: Valida si el QR existe y a quién pertenece
  @Query(() => Credenciale, { name: 'validarQR', nullable: true })
  async validarQR(@Args('qr_hash', { type: () => String }) qr_hash: string) {
    return await this.credencialesService.findByHash(qr_hash);
  }

  // --- MÉTODOS ADMINISTRATIVOS (CRUD) ---

  @Query(() => [Credenciale], { name: 'credenciales' })
  findAll() {
    return this.credencialesService.findAll();
  }

  @Query(() => Credenciale, { name: 'credencial', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.credencialesService.findOne(id);
  }

  @Mutation(() => Credenciale)
  createCredenciale(@Args('createCredencialeInput') data: CreateCredencialeInput) {
    return this.credencialesService.create(data);
  }

  @Mutation(() => Credenciale)
  updateCredenciale(@Args('updateCredencialeInput') data: UpdateCredencialeInput) {
    return this.credencialesService.update(data.id, data);
  }

  @Mutation(() => Credenciale)
  removeCredenciale(@Args('id', { type: () => Int }) id: number) {
    return this.credencialesService.remove(id);
  }
}