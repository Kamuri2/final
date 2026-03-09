import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlumnoInput } from './dto/create-alumno.input';
import { UpdateAlumnoInput } from './dto/update-alumno.input';

@Injectable()
export class AlumnosService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    return this.prisma.alumnos.findUnique({ where: { id } });
  }

  async findOneByMatricula(matricula: string) {
    return this.prisma.alumnos.findFirst({ where: { matricula } });
  } 
  async remove(id: number) {
    return this.prisma.alumnos.delete({ where: { id } });
  }
  async create(createAlumnoInput: CreateAlumnoInput) {
    return this.prisma.alumnos.create({
      data: createAlumnoInput,
    });
  }

  async findAll() {
    return this.prisma.alumnos.findMany({
      include: { grupos: true } // Traemos los datos del grupo también
    });
  }

  async update(id: number, updateAlumnoInput: UpdateAlumnoInput) {
    const { id: _, ...data } = updateAlumnoInput;
    return this.prisma.alumnos.update({
      where: { id },
      data,
    });
  }
}