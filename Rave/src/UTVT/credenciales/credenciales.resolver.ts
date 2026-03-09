import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CredencialesService } from './credenciales.service';
import { Credenciale } from './entities/credenciale.entity';
import { CreateCredencialeInput } from './dto/create-credenciale.input';
import { UpdateCredencialeInput } from './dto/update-credenciale.input';

@Resolver(() => Credenciale)
export class CredencialesResolver {
  constructor(private readonly credencialesService: CredencialesService) {}

  @Mutation(() => Credenciale)
  createCredenciale(@Args('createCredencialeInput') data: CreateCredencialeInput) {
    return this.credencialesService.create(data);
  }

  @Query(() => [Credenciale], { name: 'credenciales' })
  findAll() {
    return this.credencialesService.findAll();
  }

  @Query(() => Credenciale, { name: 'credencial', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.credencialesService.findOne(id);
  }

  // Nueva consulta para que la app valide el QR
  @Query(() => Credenciale, { name: 'validarQR', nullable: true })
  validarQR(@Args('qr_hash', { type: () => String }) qr_hash: string) {
    return this.credencialesService.findByHash(qr_hash);
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