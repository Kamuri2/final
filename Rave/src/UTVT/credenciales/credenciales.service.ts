import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateCredencialeInput } from './dto/create-credenciale.input';

@Injectable()
export class CredencialesService {
  constructor(private prisma: PrismaService) {}

  // 🧹 LIMPIEZA AUTOMÁTICA: Excelente práctica para limpiar los que ya se fueron a su casa
  @Cron(CronExpression.EVERY_HOUR)
  async limpiarQRsExpirados() {
    const ahora = new Date();
    const result = await this.prisma.credenciales.deleteMany({
      where: { vencimiento: { lt: ahora } }
    });
    console.log(`🧹 [RavenID CleanUp]: Se eliminaron ${result.count} credenciales caducas.`);
  }

  // 🔥 GENERACIÓN REAL Y SEGURA: Upsert de nivel empresarial
  async generarCredencialReal(usuarioId: number) {
    const usuario = await this.prisma.usuarios_sistema.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) throw new UnauthorizedException('Usuario no válido en el sistema');

    // Generación de Hash seguro
    const seed = `RAVEN-${usuario.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const hash = Buffer.from(seed).toString('base64').replace(/=/g, "");
    
    // 60 segundos de vida (ajustado a tus 2 ciclos de 30s)
    const expiracion = new Date();
    expiracion.setSeconds(expiracion.getSeconds() + 60);

    // 🛡️ EL BLINDAJE UPSERT: Busca, sobrescribe o crea sin chocar con otros alumnos
    return this.prisma.credenciales.upsert({
      where: { 
        usuario_id: usuarioId // 👈 Busca el "casillero" usando el campo @unique
      },
      update: {
        // 🔄 Si el usuario YA TIENE una fila, solo le cambiamos el código y el tiempo
        qr_hash: hash,
        vencimiento: expiracion,
        estado: "ACTIVA",
        // Lo actualizamos por si el usuario acaba de terminar su registro y antes no tenía alumno_id
        alumno_id: usuario.alumno_id,
        empleado_id: usuario.empleado_id, 
      },
      create: {
        // 🆕 Si es su primera vez usando la app, se crea su fila
        usuario_id: usuarioId,
        qr_hash: hash,
        vencimiento: expiracion,
        estado: "ACTIVA",
        alumno_id: usuario.alumno_id,
        empleado_id: usuario.empleado_id,
      },
      include: { alumnos: true }
    });
  }

  // --- MÉTODOS CRUD Y ESCÁNER (Intactos) ---

  async findByHash(qr_hash: string) {
    return this.prisma.credenciales.findUnique({
      where: { qr_hash },
      include: { 
        alumnos: {
          include: { grupos: true }
        },
        empleados: true
      }
    });
  }

  async findAll() {
    return this.prisma.credenciales.findMany({
      include: { alumnos: true, empleados: true }
    });
  }

  async findOne(id: number) {
    return this.prisma.credenciales.findUnique({ where: { id } });
  }

  async update(id: number, updateCredencialInput: any) {
    return this.prisma.credenciales.update({
      where: { id },
      data: updateCredencialInput,
      include: { alumnos: true }
    });
  }

  async remove(id: number) {
    return this.prisma.credenciales.delete({ where: { id } });
  }

  async create(createCredencialInput: CreateCredencialeInput) {
    return this.prisma.credenciales.create({
      data: createCredencialInput,
      include: { alumnos: true }
    });
  }
}