import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarreraInput } from './dto/create-carrera.input';

@Injectable()
export class CarrerasService {
  constructor(private prisma: PrismaService) {}

  // Crea la carrera
  async create(createCarreraInput: CreateCarreraInput) {
    return this.prisma.carreras.create({
      data: createCarreraInput,
    });
  }
async findOne(id: number) {
    return this.prisma.carreras.findUnique({ where: { id } });
  } 
  async remove(id: number) {
    return this.prisma.carreras.delete({ where: { id } });
  } 
  async update(id: number, updateCarreraInput: any) {
    return this.prisma.carreras.update({
      where: { id },
      data: updateCarreraInput,
    });
  }
  // Lista todas para que el Admin pueda seleccionarla
  async findAll() {
    return this.prisma.carreras.findMany({
      orderBy: { nombre: 'asc' },
    });
  }
}