import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHorarioInput } from './dto/create-horario.input';
import { UpdateHorarioInput } from './dto/update-horario.input';


@Injectable()
export class HorariosService {
  constructor(private prisma: PrismaService) {}

  async findByGrupo(grupo_id: number) {
    return this.prisma.horarios.findMany({
      where: { grupo_id },
      orderBy: { hora_entrada: 'asc' }
    });
  }
async findOne(id: number) {     
    return this.prisma.horarios.findUnique({ where: { id } });
  }
  async remove(id: number) {
    return this.prisma.horarios.delete({ where: { id } });
  }
    async update(id: number, updateHorarioInput: any) { 
    return this.prisma.horarios.update({
      where: { id },
      data: updateHorarioInput,
    });
  }   
  async findAll() {
    return this.prisma.horarios.findMany({
      orderBy: { hora_entrada: 'asc' }
    });
  }   
  async create(createHorarioInput: CreateHorarioInput) {
    return this.prisma.horarios.create({
      data: createHorarioInput
    });
  }
}