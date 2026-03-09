import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrosAccesoInput } from './dto/create-registrosacceso.input';
import { UpdateRegistrosAccesoInput } from './dto/update-registrosacceso.input';

@Injectable()
export class RegistrosAccesoService {
  constructor(private prisma: PrismaService) {}

  async registrarIntento(data: {
    concedido: boolean;
    motivo_rechazo?: string;
    punto_id: number;
    usuario_id: number;
    credencial_id?: number;
    pase_id?: number;
  }) {
    return this.prisma.registros_acceso.create({
      data: {
        ...data,
        fecha_hora: new Date(), // Sincronizado con el tiempo real del servidor
      }
    });
  }
  async findAll() {
    return this.prisma.registros_acceso.findMany({
      orderBy: { fecha_hora: 'desc' }
    });
  }
  async findOne(id: number) {
    return this.prisma.registros_acceso.findUnique({ where: { id } });
  }
  async remove(id: number) {
    return this.prisma.registros_acceso.delete({ where: { id } });
  }
  async update(id: number, updateRegistrosAccesoInput: any) {
    return this.prisma.registros_acceso.update({
      where: { id },
      data: updateRegistrosAccesoInput,
    });
  }

  // Para que RavenAdmin vea las estadísticas en el Dashboard
  async obtenerEstadisticasHoy() {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    return this.prisma.registros_acceso.count({
      where: { fecha_hora: { gte: inicioDia } }
    });
  }
}