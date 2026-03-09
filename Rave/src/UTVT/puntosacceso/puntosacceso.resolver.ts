import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PuntosAccesoService } from './puntosacceso.service';
import { PuntoAcceso } from './entities/puntosacceso.entity';
import { CreatePuntosAccesoInput } from './dto/create-puntosacceso.input';
import { UpdatePuntosAccesoInput } from './dto/update-puntosacceso.input';

@Resolver(() => PuntoAcceso)
export class PuntosAccesoResolver {
  constructor(private readonly puntosAccesoService: PuntosAccesoService) {}

  @Mutation(() => PuntoAcceso)
  createPuntoAcceso(@Args('createPuntosAccesoInput') data: CreatePuntosAccesoInput) {
    return this.puntosAccesoService.CreatePuntoAcceso(data);
  }

  @Query(() => [PuntoAcceso], { name: 'puntosAcceso' })
  findAll() {
    return this.puntosAccesoService.findAll();
  }

  @Query(() => PuntoAcceso, { name: 'puntoAcceso', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.puntosAccesoService.findOne(id);
  }

  @Mutation(() => PuntoAcceso)
  updatePuntoAcceso(@Args('updatePuntosAccesoInput') data: UpdatePuntosAccesoInput) {
    return this.puntosAccesoService.update(data.id, data);
  }

  @Mutation(() => PuntoAcceso)
  removePuntoAcceso(@Args('id', { type: () => Int }) id: number) {
    return this.puntosAccesoService.remove(id);
  }
}