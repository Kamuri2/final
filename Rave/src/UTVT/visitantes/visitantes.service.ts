import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitanteInput } from './dto/create-visitante.input';
import { UpdateVisitanteInput } from './dto/update-visitante.input';

@Injectable()
export class VisitantesService {
  constructor(private prisma: PrismaService) {}

  // 🚀 Esto arregla el error de 'findAll'
  async findAll() {
    return this.prisma.visitantes.findMany();
  }

  async create(createVisitanteInput: CreateVisitanteInput) {
    return this.prisma.visitantes.create({
      data: createVisitanteInput
    });
  } 

  // 🚀 Esto arregla el error de 'findOne'
  async findOne(id: number) {
    return this.prisma.visitantes.findUnique({ where: { id } });
  }

  // 🚀 Esto arregla el error de 'update'
  async update(id: number, updateVisitanteInput: any) {
    return this.prisma.visitantes.update({
      where: { id },
      data: updateVisitanteInput,
    });
  }

  // 🚀 Esto arregla el error de 'remove'
  async remove(id: number) {
    return this.prisma.visitantes.delete({ where: { id } });
  }
}