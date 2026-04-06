import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateCredencialeInput } from './dto/create-credenciale.input';

@Injectable()
export class CredencialesService {
  constructor(private prisma: PrismaService) {}

  // 🔥 GENERACIÓN: 30 segundos con normalización UTC
  async generarCredencialReal(usuarioId: number) {
    const usuario = await this.prisma.usuarios_sistema.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new UnauthorizedException('Usuario no válido');

    const seed = `RAVEN-${usuario.id}-${Date.now()}`;
    const hash = Buffer.from(seed).toString('base64').replace(/=/g, "");
    
    const expiracion = new Date();
    expiracion.setSeconds(expiracion.getSeconds() + 30); // 👈 2 minutos para pruebas

    return this.prisma.credenciales.upsert({
      where: { usuario_id: usuarioId },
      update: { qr_hash: hash, vencimiento: expiracion, estado: "ACTIVA" },
      create: { 
        usuario_id: usuarioId, 
        qr_hash: hash, 
        vencimiento: expiracion, 
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

    // 🕒 COMPARACIÓN DE MILISEGUNDOS UTC (Ignora las 6 horas)
    const ahoraMs = Date.now(); 
    const vencimientoMs = new Date(credencial.vencimiento).getTime();

    // LOG DE SEGURIDAD EN TU TERMINAL
    console.log(`⏱️ Quedan: ${(vencimientoMs - ahoraMs) / 1000} segundos de vida.`);

    if (ahoraMs > vencimientoMs) {
      await this.registrarEvento(credencial.usuario_id, puntoId, verificadorId, false, 'QR EXPIRADO', credencial.id);
      return { valido: false, mensaje: 'EL CÓDIGO HA EXPIRADO', alumno: credencial.alumnos };
    }

    // --- SANCIONES ---
    const tieneBloqueo = credencial.alumnos?.sanciones.some(s => s.bloquea_acceso);
    if (tieneBloqueo) {
      await this.registrarEvento(credencial.usuario_id, puntoId, verificadorId, false, 'ALUMNO SANCIONADO', credencial.id);
      return { valido: false, mensaje: 'ACCESO BLOQUEADO', alumno: credencial.alumnos };
    }

    // --- ✅ EXITO ---
    await this.registrarEvento(credencial.usuario_id, puntoId, verificadorId, true, null, credencial.id);
    return { valido: true, mensaje: 'ACCESO PERMITIDO', alumno: credencial.alumnos };
  }
  // --- 🛠️ MÉTODOS CRUD (Necesarios para el Resolver de tu imagen 3) ---

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
    console.log("📝 Intentando registrar evento para usuario:", usuarioId);
    
    return await this.prisma.registros_acceso.create({
      data: {
        concedido,
        motivo_rechazo: motivo,
        punto_id: puntoId,
        usuario_id: usuarioId, 
        credencial_id: credencialId,
        fecha_hora: new Date()
      }
    });
  } catch (error) {
    // 🚨 ESTO TE DIRÁ LA VERDAD EN LA TERMINAL
    console.error("❌ ERROR CRÍTICO AL GUARDAR REGISTRO:", error.message);
    console.error("🔍 Revisa que punto_id y usuario_id existan en sus tablas.");
  }
}

  @Cron(CronExpression.EVERY_HOUR)
  async limpiarQRsExpirados() {
    await this.prisma.credenciales.deleteMany({ where: { vencimiento: { lt: new Date() } } });
  }
}