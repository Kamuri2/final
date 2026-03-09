import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CarrerasService } from './carreras.service';
import { Carrera } from './entities/carrera.entity';
import { CreateCarreraInput } from './dto/create-carrera.input';
import { UpdateCarreraInput } from './dto/update-carrera.input';

@Resolver(() => Carrera)
export class CarrerasResolver {
  constructor(private readonly carrerasService: CarrerasService) {}

  @Mutation(() => Carrera)
  createCarrera(@Args('createCarreraInput') data: CreateCarreraInput) { return this.carrerasService.create(data); }

  @Query(() => [Carrera], { name: 'carreras' })
  findAll() { return this.carrerasService.findAll(); }

  @Query(() => Carrera, { name: 'carrera', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) { return this.carrerasService.findOne(id); }

  @Mutation(() => Carrera)
  updateCarrera(@Args('updateCarreraInput') data: UpdateCarreraInput) { return this.carrerasService.update(data.id, data); }

  @Mutation(() => Carrera)
  removeCarrera(@Args('id', { type: () => Int }) id: number) { return this.carrerasService.remove(id); }
}