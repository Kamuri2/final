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
      fecha_hora: new Date(), // 👈 Usa la hora real del sistema (UTC)
    }
  });
}
 //async obtenerReportePorDia(fechaStr: string) {
  //const inicio = new Date(`${fechaStr}T00:00:00`);
  //const fin = new Date(`${fechaStr}T23:59:59`);

  //return this.prisma.registros_acceso.findMany({
    //where: {
      //fecha_hora: { gte: inicio, lte: fin },
    //},
    //include: {
      //usuarios_sistema: {
        //include: {
          //alumnos: {
            //include: {
              //grupos: true, // 👈 Solo grupos, carrera no porque es String
            //},
          //},  
          //}
        //}
      //},
      //puntos_acceso: true, // 👈 Asegúrate que en Prisma se llame así
    //},
    //orderBy: { fecha_hora: 'desc' },
  //});
//}
async obtenerReportePorDia(fechaStr: string) {
  // Mantenemos el rango de 6am a 6am UTC para capturar el día completo de México
  const inicio = new Date(`${fechaStr}T06:00:00.000Z`); 
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);

  return this.prisma.registros_acceso.findMany({
    where: {
      fecha_hora: {
        gte: inicio,
        lt: fin,
      },
    },
    include: {
      usuarios_sistema: { include: { alumnos: { include: { grupos: true } } } },
      puntos_acceso: true,
    },
    // 🔽 CAMBIO AQUÍ: de 'desc' a 'asc' para ir de hora menor a mayor
    orderBy: { 
      fecha_hora: 'asc' 
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