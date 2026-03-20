import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitanteInput } from './dto/create-visitante.input';
import { UpdateVisitanteInput } from './dto/update-visitante.input';

@Injectable()
export class VisitantesService {
  constructor(private prisma: PrismaService) {}

  
  async findAll() {
    return this.prisma.visitantes.findMany();
  }

  async create(createVisitanteInput: CreateVisitanteInput) {
    return this.prisma.visitantes.create({
      data: createVisitanteInput
    });
  } 

  async findOne(id: number) {
    return this.prisma.visitantes.findUnique({ where: { id } });
  }

  
  async update(id: number, updateVisitanteInput: any) {
    return this.prisma.visitantes.update({
      where: { id },
      data: updateVisitanteInput,
    });
  }

  
  async remove(id: number) {
    return this.prisma.visitantes.delete({ where: { id } });
  }
}