import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AlumnosService } from './alumnos.service';
import { Alumno } from './entities/alumno.entity';
import { CreateAlumnoInput } from './dto/create-alumno.input';
import { UpdateAlumnoInput } from './dto/update-alumno.input';

@Resolver(() => Alumno)
export class AlumnosResolver {
  constructor(private readonly alumnosService: AlumnosService) {}

  // Mutation para crear un alumno nuevo
  @Mutation(() => Alumno)
  async createAlumno(@Args('createAlumnoInput') createAlumnoInput: CreateAlumnoInput) {
    return await this.alumnosService.create(createAlumnoInput);
  }

  // Query para obtener la lista de todos los alumnos
  @Query(() => [Alumno], { name: 'alumnos' })
  async findAll() {
    return await this.alumnosService.findAll();
  }

  // Query CLAVE: Busca por matrícula (String)
  // Es la que usará app móvil para validar el acceso
  @Query(() => Alumno, { name: 'alumno', nullable: true })
  async findOne(@Args('matricula', { type: () => String }) matricula: string) {
    return await this.alumnosService.findOneByMatricula(matricula);
  }

  // Mutation para actualizar datos
  @Mutation(() => Alumno)
  async updateAlumno(@Args('updateAlumnoInput') updateAlumnoInput: UpdateAlumnoInput) {
    // Nota: Asegúrate de que en tu update-alumno.input.ts el campo se llame id_alumno
    return await this.alumnosService.update(updateAlumnoInput.id, updateAlumnoInput);
  }

  // Mutation para eliminar un alumno por su ID interno
  @Mutation(() => Alumno)
  async removeAlumno(@Args('id', { type: () => Int }) id: number) {
    return await this.alumnosService.remove(id);
  }
}