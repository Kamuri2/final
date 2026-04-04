import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql'; // 👈 Agregamos ResolveField y Parent
import { CarrerasService } from './carreras.service';
import { Carrera } from './entities/carrera.entity';
import { Grupo } from '../grupos/entities/grupo.entity'; // 👈 Importa la entidad Grupo
import { CreateCarreraInput } from './dto/create-carrera.input';
import { UpdateCarreraInput } from './dto/update-carrera.input';
import { PrismaService } from '../prisma/prisma.service'; // 👈 Necesitamos Prisma aquí

@Resolver(() => Carrera)
export class CarrerasResolver {
  constructor(
    private readonly carrerasService: CarrerasService,
    private readonly prisma: PrismaService // 👈 Inyectamos Prisma
  ) {}

 @ResolveField(() => [Grupo])
  async grupos(@Parent() carrera: Carrera) {
    // 🔍 Esto nos dirá en la terminal de la Machenike qué ID está llegando
    const carreraId = Number(carrera.id);
    console.log(`🔎 Buscando grupos para la carrera ID: ${carreraId}`);

    if (!carreraId) return [];

    return this.prisma.grupos.findMany({
      where: { carrera_id: carreraId },
    });
  }

  @Mutation(() => Carrera)
  createCarrera(@Args('createCarreraInput') data: CreateCarreraInput) { 
    return this.carrerasService.create(data); 
  }

  @Query(() => [Carrera], { name: 'carreras' })
  findAll() { 
    return this.carrerasService.findAll(); 
  }

  @Query(() => Carrera, { name: 'carrera', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) { 
    return this.carrerasService.findOne(id); 
  }

  @Mutation(() => Carrera)
  updateCarrera(@Args('updateCarreraInput') data: UpdateCarreraInput) { 
    return this.carrerasService.update(data.id, data); 
  }

  @Mutation(() => Carrera)
  removeCarrera(@Args('id', { type: () => Int }) id: number) { 
    return this.carrerasService.remove(id); 
  }
}