import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePuntosAccesoInput } from './dto/create-puntosacceso.input';
import { UpdatePuntosAccesoInput } from './dto/update-puntosacceso.input';

@Injectable()
export class PuntosAccesoService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.puntos_acceso.findMany();
  }
async findOne(id: number) {
    return this.prisma.puntos_acceso.findUnique({ where: { id } });
  }
  async remove(id: number) {
    return this.prisma.puntos_acceso.delete({ where: { id } });
  } 
  async update(id: number, updatePuntosAccesoInput: any) {
    return this.prisma.puntos_acceso.update({
      where: { id },
      data: updatePuntosAccesoInput,
    });
  }
  async CreatePuntoAcceso(createPuntosAccesoInput: CreatePuntosAccesoInput) {
    return this.prisma.puntos_acceso.create({
      data: createPuntosAccesoInput
    });
  } 
  
  async findByTipo(tipo: string) {
    return this.prisma.puntos_acceso.findMany({ where: { tipo } });
  }
  async create(ubicacion: string, tipo: string) {
    return this.prisma.puntos_acceso.create({
      data: { ubicacion, tipo }
    });
  }
}