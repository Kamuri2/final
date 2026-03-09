import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DepartamentosService } from './departamentos.service';
import { Departamento } from './entities/departamento.entity';
import { CreateDepartamentoInput } from './dto/create-departamento.input';
import { UpdateDepartamentoInput } from './dto/update-departamento.input';

@Resolver(() => Departamento)
export class DepartamentosResolver {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Mutation(() => Departamento)
  createDepartamento(@Args('createDepartamentoInput') data: CreateDepartamentoInput) {
    return this.departamentosService.create(data);
  }

  @Query(() => [Departamento], { name: 'departamentos' })
  findAll() {
    return this.departamentosService.findAll();
  }

  @Query(() => Departamento, { name: 'departamento', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.departamentosService.findOne(id);
  }

  @Mutation(() => Departamento)
  updateDepartamento(@Args('updateDepartamentoInput') data: UpdateDepartamentoInput) {
    return this.departamentosService.update(data.id, data);
  }

  @Mutation(() => Departamento)
  removeDepartamento(@Args('id', { type: () => Int }) id: number) {
    return this.departamentosService.remove(id);
  }
}