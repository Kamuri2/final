import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartamentoInput } from './dto/create-departamento.input';
import { UpdateDepartamentoInput } from './dto/update-departamento.input';

@Injectable()
export class DepartamentosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.departamentos.findMany({
      orderBy: { nombre_depto: 'asc' },
    });
  }
  async findOne(id: number) { 
    return this.prisma.departamentos.findUnique({ where: { id } });
  }
  async remove(id: number) {
    return this.prisma.departamentos.delete({ where: { id } });
  } 
async update(id: number, updateDepartamentoInput: any) {
    return this.prisma.departamentos.update({
      where: { id },  
      data: updateDepartamentoInput,
    });
  } 
  async create(createDepartamentoInput: CreateDepartamentoInput) {
    return this.prisma.departamentos.create({
      data: createDepartamentoInput,
    });
  }
} 