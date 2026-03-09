import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VisitantesService } from './visitantes.service';
import { Visitante } from './entities/visitante.entity';
import { CreateVisitanteInput } from './dto/create-visitante.input';
import { UpdateVisitanteInput } from './dto/update-visitante.input';

@Resolver(() => Visitante)
export class VisitantesResolver {
  constructor(private readonly visitantesService: VisitantesService) {}

  @Mutation(() => Visitante)
  createVisitante(@Args('createVisitanteInput') data: CreateVisitanteInput) { return this.visitantesService.create(data); }

  @Query(() => [Visitante], { name: 'visitantes' })
  findAll() { return this.visitantesService.findAll(); }

  @Query(() => Visitante, { name: 'visitante', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) { return this.visitantesService.findOne(id); }

  @Mutation(() => Visitante)
  updateVisitante(@Args('updateVisitanteInput') data: UpdateVisitanteInput) { return this.visitantesService.update(data.id, data); }

  @Mutation(() => Visitante)
  removeVisitante(@Args('id', { type: () => Int }) id: number) { return this.visitantesService.remove(id); }
}