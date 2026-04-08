import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateCredencialeInput } from './dto/create-credenciale.input';

@Injectable()
export class CredencialesService {
  constructor(private prisma: PrismaService) {}

  // FUNCIÓN MAESTRA: Obtiene la fecha actual ajustada a México (UTC-6)
  private getMexicoDate(): Date {
    const ahora = new Date();
    // Restamos 6 horas (6 * 60 * 60 * 1000 ms)
    return new Date(ahora.getTime() - (6 * 60 * 60 * 1000));
  }

  // GENERACIÓN: 30 segundos exactos con hora local
  async generarCredencialReal(usuarioId: number) {
    const usuario = await this.prisma.usuarios_sistema.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new UnauthorizedException('Usuario no válido');

    const ahoraMexico = this.getMexicoDate();
    const ahoraMs = ahoraMexico.getTime();
    
    const seed = `RAVEN-${usuario.id}-${ahoraMs}`;
    const hash = Buffer.from(seed).toString('base64').replace(/=/g, "");
    
    // El vencimiento será 30 segundos después de la hora de México
    const vencimiento = new Date(ahoraMs + 30 * 1000); 

    return this.prisma.credenciales.upsert({
      where: { usuario_id: usuarioId },
      update: { qr_hash: hash, vencimiento: vencimiento, estado: "ACTIVA" },
      create: { 
        usuario_id: usuarioId, 
        qr_hash: hash, 
        vencimiento: vencimiento, 
        estado: "ACTIVA",
        alumno_id: usuario.alumno_id,
        empleado_id: usuario.empleado_id 
      },
      include: { alumnos: true }
    });
  }

  async validarAccesoReal(qr_hash: string, puntoId: number, verificadorId: number) {
    const credencial = await this.prisma.credenciales.findUnique({
      where: { qr_hash },
      include: { alumnos: { include: { sanciones: true } } }
    });

    if (!credencial) {
      await this.registrarEvento(verificadorId, puntoId, verificadorId, false, 'QR NO ENCONTRADO');
      return { valido: false, mensaje: 'CÓDIGO NO VÁLIDO' };
    }

    // Comparación usando hora local ajustada
    const ahoraMs = this.getMexicoDate().getTime(); 
    const vencimientoMs = new Date(credencial.vencimiento).getTime();

    const restante = Math.floor((vencimientoMs - ahoraMs) / 1000);
    console.log(`⏱️ El QR tiene ${restante} segundos de vida restantes (Hora Local).`);

    if (ahoraMs > vencimientoMs) {
      await this.registrarEvento(credencial.usuario_id, puntoId, verificadorId, false, 'QR EXPIRADO', credencial.id);
      return { valido: false, mensaje: 'EL CÓDIGO HA EXPIRADO', alumno: credencial.alumnos };
    }

    //  SANCIONES 
    const tieneBloqueo = credencial.alumnos?.sanciones.some(s => s.bloquea_acceso);
    if (tieneBloqueo) {
      await this.registrarEvento(credencial.usuario_id, puntoId, verificadorId, false, 'ALUMNO SANCIONADO', credencial.id);
      return { valido: false, mensaje: 'ACCESO BLOQUEADO', alumno: credencial.alumnos };
    }

    //  EXITO 
    await this.registrarEvento(credencial.usuario_id, puntoId, verificadorId, true, null, credencial.id);
    return { valido: true, mensaje: 'ACCESO PERMITIDO', alumno: credencial.alumnos };
  }

  // MÉTODOS CRUD 

  async findByHash(qr_hash: string) {
    return this.prisma.credenciales.findUnique({
      where: { qr_hash },
      include: { alumnos: { include: { grupos: true } }, empleados: true }
    });
  }

  async create(data: CreateCredencialeInput) {
    return this.prisma.credenciales.create({ data, include: { alumnos: true } });
  }

  async update(id: number, data: any) {
    return this.prisma.credenciales.update({ where: { id }, data, include: { alumnos: true } });
  }

  async findAll() {
    return this.prisma.credenciales.findMany({ include: { alumnos: true, empleados: true } });
  }

  async findOne(id: number) {
    return this.prisma.credenciales.findUnique({ where: { id } });
  }

  async remove(id: number) {
    return this.prisma.credenciales.delete({ where: { id } });
  }

  private async registrarEvento(
    usuarioId: number, 
    puntoId: number, 
    verificadorId: number, 
    concedido: boolean, 
    motivo: string | null = null, 
    credencialId: number | null = null
  ) {
    try {
      console.log("📝 Registrando evento con hora de México...");
      
      return await this.prisma.registros_acceso.create({
        data: {
          concedido,
          motivo_rechazo: motivo,
          punto_id: puntoId,
          usuario_id: usuarioId, 
          credencial_id: credencialId,
          // Usamos la función de ajuste aquí también
          fecha_hora: this.getMexicoDate() 
        }
      });
    } catch (error) {
      console.error("❌ ERROR AL GUARDAR REGISTRO:", error.message);
    }
  }

  // LIMPIEZA DIARIA
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async limpiarQRsExpirados() {
    console.log("🧹 Iniciando limpieza diaria...");
    const ahoraMexico = this.getMexicoDate();
    const resultado = await this.prisma.credenciales.deleteMany({ 
        where: { vencimiento: { lt: ahoraMexico } } 
    });
    console.log(` Se eliminaron ${resultado.count} QR expirados.`);
  }
}