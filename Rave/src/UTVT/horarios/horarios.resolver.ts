import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { HorariosService } from './horarios.service';
import { Horario } from './entities/horario.entity';
import { CreateHorarioInput } from './dto/create-horario.input';
import { UpdateHorarioInput } from './dto/update-horario.input';

@Resolver(() => Horario)
export class HorariosResolver {
  constructor(private readonly horariosService: HorariosService) {}

  @Mutation(() => Horario)
  createHorario(@Args('createHorarioInput') data: CreateHorarioInput) {
    return this.horariosService.create(data);
  }

  @Query(() => [Horario], { name: 'horarios' })
  findAll() {
    return this.horariosService.findAll();
  }

  @Query(() => Horario, { name: 'horario', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.horariosService.findOne(id);
  }

  @Mutation(() => Horario)
  updateHorario(@Args('updateHorarioInput') data: UpdateHorarioInput) {
    return this.horariosService.update(data.id, data);
  }

  @Mutation(() => Horario)
  removeHorario(@Args('id', { type: () => Int }) id: number) {
    return this.horariosService.remove(id);
  }
}