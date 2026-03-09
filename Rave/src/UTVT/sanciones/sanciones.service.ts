import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSancionInput } from './dto/create-sancione.input';
import { UpdateSancionInput } from './dto/update-sancione.input';

@Injectable()
export class SancionesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { motivo: string; bloquea_acceso: boolean; alumno_id: number }) {
    return this.prisma.sanciones.create({ data });
  }
async findAll() {
    return this.prisma.sanciones.findMany();
  } 
  async update(id: number, updateSancionInput: any) {
    return this.prisma.sanciones.update({
      where: { id },
      data: updateSancionInput,
    });
  }
  async findActivasByAlumno(alumno_id: number) {
    return this.prisma.sanciones.findMany({
      where: { alumno_id, bloquea_acceso: true }
    });
  }
  async remove(id: number) {
    return this.prisma.sanciones.delete({ where: { id } });
  }
  async findOne(id: number) {   
    return this.prisma.sanciones.findUnique({ where: { id } });
  }
  // Método vital para el escáner: ¿Este alumno puede pasar?
  async tieneBloqueoActivo(alumno_id: number): Promise<boolean> {
    const sancion = await this.prisma.sanciones.findFirst({
      where: { alumno_id, bloquea_acceso: true }
    });
    return !!sancion; // Retorna true si existe una sanción bloqueante
  }
}