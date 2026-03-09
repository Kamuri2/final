import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoInput } from './dto/create-empleado.input';
import { UpdateEmpleadoInput } from './dto/update-empleado.input';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) {}

  async create(createEmpleadoInput: CreateEmpleadoInput) {
    return this.prisma.empleados.create({
      data: createEmpleadoInput,
      include: { departamentos: true }
    });
  }
async findOne(id: number) {
    return this.prisma.empleados.findUnique({ where: { id }, include: { departamentos: true } });
  } 
  async remove(id: number) {
    return this.prisma.empleados.delete({ where: { id } });
  } 
  async findByNumeroEmpleado(num_empleado: string) {
    return this.prisma.empleados.findFirst({ where: { num_empleado }, include: { departamentos: true } });
  } 
  async update(id: number, updateEmpleadoInput: any) {
    return this.prisma.empleados.update({
      where: { id },
      data: updateEmpleadoInput,
      include: { departamentos: true }
    });
  }
  async findAll() {
    return this.prisma.empleados.findMany({
      include: { departamentos: true }
    });
  }
}