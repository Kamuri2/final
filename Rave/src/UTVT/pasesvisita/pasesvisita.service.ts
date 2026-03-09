import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaseVisitaInput } from './dto/create-pasesvisita.input';
import { UpdatePasesVisitaInput } from './dto/update-pasesvisita.input';

@Injectable()
export class PasesVisitaService {
  constructor(private prisma: PrismaService) {}

  async create(createPaseVisitaInput: CreatePaseVisitaInput) {
    return this.prisma.pases_visita.create({
      data: createPaseVisitaInput,
      include: { visitantes: true }
    });
  }
async findOne(id: number) { 
    return this.prisma.pases_visita.findUnique({ where: { id }, include: { visitantes: true } });

  }
  async remove(id: number) {
    return this.prisma.pases_visita.delete({ where: { id } });
  } 
  async update(id: number, updatePaseVisitaInput: any) {
    return this.prisma.pases_visita.update({
      where: { id },
      data: updatePaseVisitaInput,
      include: { visitantes: true }
    });
  }
  async findAll() {
    return this.prisma.pases_visita.findMany({
      include: { visitantes: true }
    });
  }
  async ValidarPaseHash(qr_hash: string) {
    return this.prisma.pases_visita.findUnique({
      where: { qr_hash },
      include: { visitantes: true }
    });
  } 
  // Lógica matemática: ¿El pase sigue vigente?
  async isPaseValido(qr_hash: string) {
    const pase = await this.prisma.pases_visita.findUnique({
      where: { qr_hash }
    });
    
    if (!pase) return false;
    return new Date() < pase.expiracion; // Retorna true si aún no expira
  }
}