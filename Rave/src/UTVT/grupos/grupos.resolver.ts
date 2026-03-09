import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GruposService } from './grupos.service';
import { Grupo } from './entities/grupo.entity';
import { CreateGrupoInput } from './dto/create-grupo.input';
import { UpdateGrupoInput } from './dto/update-grupo.input';

@Resolver(() => Grupo)
export class GruposResolver {
  constructor(private readonly gruposService: GruposService) {}

  @Mutation(() => Grupo)
  createGrupo(@Args('createGrupoInput') data: CreateGrupoInput) { return this.gruposService.create(data); }

  @Query(() => [Grupo], { name: 'grupos' })
  findAll() { return this.gruposService.findAll(); }

  @Query(() => Grupo, { name: 'grupo', nullable: true })
  findOne(@Args('id_grupo', { type: () => Int }) id_grupo: number) { return this.gruposService.findOne(id_grupo); }

  @Mutation(() => Grupo)
  updateGrupo(@Args('updateGrupoInput') data: UpdateGrupoInput) { return this.gruposService.update(data.id_grupo, data); }

  @Mutation(() => Grupo)
  removeGrupo(@Args('id_grupo', { type: () => Int }) id_grupo: number) { return this.gruposService.remove(id_grupo); }
}