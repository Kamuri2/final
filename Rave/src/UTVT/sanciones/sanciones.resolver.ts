import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SancionesService } from './sanciones.service';
import { Sancion } from './entities/sancione.entity';
import { CreateSancionInput } from './dto/create-sancione.input';
import { UpdateSancionInput } from './dto/update-sancione.input';

@Resolver(() => Sancion)
export class SancionesResolver {
  constructor(private readonly sancionesService: SancionesService) {}

  @Mutation(() => Sancion)
  createSancion(@Args('createSancionInput') data: CreateSancionInput) {
    return this.sancionesService.create(data);
  }

  @Query(() => [Sancion], { name: 'sanciones' })
  findAll() {
    return this.sancionesService.findAll();
  }

  @Query(() => Sancion, { name: 'sancion', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.sancionesService.findOne(id);
  }

  // Consulta para que el sistema sepa si el alumno tiene bloqueos
  @Query(() => [Sancion], { name: 'sancionesActivasAlumno' })
  sancionesActivas(@Args('alumno_id', { type: () => Int }) alumno_id: number) {
    return this.sancionesService.findActivasByAlumno(alumno_id);
  }

  @Mutation(() => Sancion)
  updateSancion(@Args('updateSancionInput') data: UpdateSancionInput) {
    return this.sancionesService.update(data.id, data);
  }

  @Mutation(() => Sancion)
  removeSancion(@Args('id', { type: () => Int }) id: number) {
    return this.sancionesService.remove(id);
  }
}