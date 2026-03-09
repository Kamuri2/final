import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PasesVisitaService } from './pasesvisita.service';
import { PaseVisita } from './entities/pasesvisita.entity';
import { CreatePaseVisitaInput } from './dto/create-pasesvisita.input';
import { UpdatePasesVisitaInput } from './dto/update-pasesvisita.input';

@Resolver(() => PaseVisita)
export class PasesVisitaResolver {
  constructor(private readonly pasesVisitaService: PasesVisitaService) {}

  @Mutation(() => PaseVisita)
  createPaseVisita(@Args('createPasesVisitaInput') data: CreatePaseVisitaInput) { return this.pasesVisitaService.create(data); }

  @Query(() => [PaseVisita], { name: 'pasesVisita' })
  findAll() { return this.pasesVisitaService.findAll(); }

  @Query(() => PaseVisita, { name: 'paseVisita', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) { return this.pasesVisitaService.findOne(id); }

  // Query para que la app valide pases de visitantes
  @Query(() => PaseVisita, { name: 'validarPaseQR', nullable: true })
  validarPaseQR(@Args('qr_hash', { type: () => String }) qr_hash: string) {
    return this.pasesVisitaService.ValidarPaseHash(qr_hash);
  }

  @Mutation(() => PaseVisita)
  updatePaseVisita(@Args('updatePasesVisitaInput') data: UpdatePasesVisitaInput) { return this.pasesVisitaService.update(data.id, data); }

  @Mutation(() => PaseVisita)
  removePaseVisita(@Args('id', { type: () => Int }) id: number) { return this.pasesVisitaService.remove(id); }
}