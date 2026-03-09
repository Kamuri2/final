import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EmpleadosService } from './empleados.service';
import { Empleado } from './entities/empleado.entity';
import { CreateEmpleadoInput } from './dto/create-empleado.input';
import { UpdateEmpleadoInput } from './dto/update-empleado.input';

@Resolver(() => Empleado)
export class EmpleadosResolver {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Mutation(() => Empleado)
  createEmpleado(@Args('createEmpleadoInput') data: CreateEmpleadoInput) { return this.empleadosService.create(data); }

  @Query(() => [Empleado], { name: 'empleados' })
  findAll() { return this.empleadosService.findAll(); }

  @Query(() => Empleado, { name: 'empleado', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) { return this.empleadosService.findOne(id); }

  @Query(() => Empleado, { name: 'empleadoPorNum', nullable: true })
  findByNumEmpleado(@Args('num_empleado', { type: () => String }) num_empleado: string) { 
    return this.empleadosService.findByNumeroEmpleado(num_empleado); 
  }

  @Mutation(() => Empleado)
  updateEmpleado(@Args('updateEmpleadoInput') data: UpdateEmpleadoInput) { return this.empleadosService.update(data.id, data); }

  @Mutation(() => Empleado)
  removeEmpleado(@Args('id', { type: () => Int }) id: number) { return this.empleadosService.remove(id); }
}