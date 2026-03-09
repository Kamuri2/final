import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RegistrosAccesoService } from './registrosacceso.service';
import { RegistroAcceso } from './entities/registrosacceso.entity';
import { CreateRegistrosAccesoInput } from './dto/create-registrosacceso.input';
import { UpdateRegistrosAccesoInput } from './dto/update-registrosacceso.input';

@Resolver(() => RegistroAcceso)
export class RegistrosAccesoResolver {
  constructor(private readonly registrosAccesoService: RegistrosAccesoService) {}

  @Mutation(() => RegistroAcceso)
  createRegistroAcceso(@Args('createRegistrosAccesoInput') data: CreateRegistrosAccesoInput) {
    // Aquí usamos la función que creamos en tu servicio
    return this.registrosAccesoService.registrarIntento(data); 
  }

  @Query(() => [RegistroAcceso], { name: 'registrosAcceso' })
  findAll() {
    return this.registrosAccesoService.findAll();
  }

  @Query(() => RegistroAcceso, { name: 'registroAcceso', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    // Asegúrate de tener findOne en tu servicio de registros_acceso
    return this.registrosAccesoService.findOne(id);
  }

  @Mutation(() => RegistroAcceso)
  updateRegistroAcceso(@Args('updateRegistrosAccesoInput') data: UpdateRegistrosAccesoInput) {
    // Asegúrate de tener update en tu servicio de registros_acceso
    return this.registrosAccesoService.update(data.id, data);
  }

  @Mutation(() => RegistroAcceso)
  removeRegistroAcceso(@Args('id', { type: () => Int }) id: number) {
    // Asegúrate de tener remove en tu servicio de registros_acceso
    return this.registrosAccesoService.remove(id);
  }
}