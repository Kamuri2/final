import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrosAccesoInput } from './dto/create-registrosacceso.input';
import { UpdateRegistrosAccesoInput } from './dto/update-registrosacceso.input';

@Injectable()
export class RegistrosAccesoService {
  constructor(private prisma: PrismaService) {}

  // 🕒 Ayudante para mantener la hora de México (UTC-6)
  private getMexicoDate(): Date {
    const ahora = new Date();
    return new Date(ahora.getTime() - (6 * 60 * 60 * 1000));
  }

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
        fecha_hora: this.getMexicoDate(), // 👈 Sincronizado con hora de México
      }
    });
  }

  // 📊 NUEVO: El motor del Reporte para el Admin
  async obtenerReportePorDia(fechaStr: string) {
    // fechaStr llega como "2026-04-06"
    // Creamos el rango de ese día en específico
    const inicio = new Date(`${fechaStr}T00:00:00.000Z`);
    const fin = new Date(`${fechaStr}T23:59:59.999Z`);

    return this.prisma.registros_acceso.findMany({
      where: {
        fecha_hora: {
          gte: inicio,
          lte: fin,
        },
      },
      include: {
        // Jalamos toda la cadena de datos para el Admin
        usuarios_sistema: {
          include: {
            alumnos: {
              include: { // Nombre de la carrera
                grupos: true, 
                sanciones: true,  // Nombre del grupo (TIC-71, etc)
              }
            }
          }
        },
        puntos_acceso: true, // Nombre del lugar (Entrada Principal, etc)
      },
      orderBy: {
        fecha_hora: 'desc', // Los más recientes primero
      },
    });
  }

  async findAll() {
    return this.prisma.registros_acceso.findMany({
      include: {
        usuarios_sistema: { include: { alumnos: true } },
        puntos_acceso: true
      },
      orderBy: { fecha_hora: 'desc' }
    });
  }

  async findOne(id: number) {
    return this.prisma.registros_acceso.findUnique({ 
      where: { id },
      include: { usuarios_sistema: { include: { alumnos: true } } }
    });
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
    const inicioDia = this.getMexicoDate();
    inicioDia.setHours(0, 0, 0, 0);

    return this.prisma.registros_acceso.count({
      where: { fecha_hora: { gte: inicioDia } }
    });
  }
}