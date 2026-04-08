import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RegistrosAccesoService } from './registrosacceso.service';
import { RegistroAcceso } from './entities/registrosacceso.entity';
import { CreateRegistrosAccesoInput } from './dto/create-registrosacceso.input';
import { UpdateRegistrosAccesoInput } from './dto/update-registrosacceso.input';

@Resolver(() => RegistroAcceso)
export class RegistrosAccesoResolver {
  constructor(private readonly registrosAccesoService: RegistrosAccesoService) {}

  //  NUEVO: Query para el reporte del Admin
  @Query(() => [RegistroAcceso], { name: 'reporteDiario' })
  async getReporteDiario(
    @Args('fecha', { type: () => String }) fecha: string // Recibe "YYYY-MM-DD"
  ) {
    return this.registrosAccesoService.obtenerReportePorDia(fecha);
  }

  
  @Mutation(() => RegistroAcceso)
  createRegistroAcceso(@Args('createRegistrosAccesoInput') data: CreateRegistrosAccesoInput) {
    return this.registrosAccesoService.registrarIntento(data); 
  }

  @Query(() => [RegistroAcceso], { name: 'registrosAcceso' })
  findAll() {
    return this.registrosAccesoService.findAll();
  }

  @Query(() => RegistroAcceso, { name: 'registroAcceso', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.registrosAccesoService.findOne(id);
  }

  @Mutation(() => RegistroAcceso)
  updateRegistroAcceso(@Args('updateRegistrosAccesoInput') data: UpdateRegistrosAccesoInput) {
    return this.registrosAccesoService.update(data.id, data);
  }

  @Mutation(() => RegistroAcceso)
  removeRegistroAcceso(@Args('id', { type: () => Int }) id: number) {
    return this.registrosAccesoService.remove(id);
  }
}