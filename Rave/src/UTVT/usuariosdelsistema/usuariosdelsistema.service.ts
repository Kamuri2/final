import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioSistemaInput } from './dto/create-usuariosdelsistema.input';
import { UpdateUsuariosSistemaInput } from './dto/update-usuariosdelsistema.input';

@Injectable()
export class UsuarioSistemaService {
  constructor(private prisma: PrismaService) {}

  // 🔐 LOGIN (Sencillo y directo)
  async loginUsuario(username: string, password: string) {
    const usuario = await this.prisma.usuarios_sistema.findFirst({
      where: { username },
    });

    if (!usuario || usuario.password !== password) {
      throw new UnauthorizedException('Datos incorrectos');
    }

    return {
      token: 'TOKEN_REAL_' + usuario.username,
      rol: usuario.rol_id === 1 ? 'ADMIN' : 'ALUMNO',
      id: usuario.id 
    };
  }

  // 📝 REGISTRO INICIAL
  async create(data: CreateUsuarioSistemaInput) {
    return this.prisma.usuarios_sistema.create({
      data: {
        username: data.username,
        password: data.password,
        rol_id: data.rol_id || 2, 
        registro_completo: false,
      },
    });
  }

  // 🛠️ EL CORAZÓN DEL SISTEMA: Actualización y Vínculo
  async update(id: number, input: UpdateUsuariosSistemaInput) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verificamos que el usuario exista
      const usuario = await tx.usuarios_sistema.findUnique({ 
        where: { id },
        include: { alumnos: true } 
      });

      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      // 2. CREAR O ACTUALIZAR ALUMNO
      // Si el usuario ya tiene un alumno_id, lo actualizamos. Si no, lo creamos.
      let alumnoId = usuario.alumno_id;

      if (!alumnoId) {
        const nuevoAlumno = await tx.alumnos.create({
          data: {
            nombre_completo: input.nombre_completo!,
            matricula: input.matricula!,
            carrera: input.carrera,    // 👈 Guardamos Carrera
            semestre: input.semestre, // 👈 Guardamos Semestre
            grupo_id: 1, 
            estado_academico: 'ACTIVO',
          },
        });
        alumnoId = nuevoAlumno.id;
      } else {
        await tx.alumnos.update({
          where: { id: alumnoId },
          data: {
            nombre_completo: input.nombre_completo,
            matricula: input.matricula,
            carrera: input.carrera,
            semestre: input.semestre,
          }
        });
      }

      // 3. ACTUALIZAMOS EL USUARIO (Liberamos el QR)
      return tx.usuarios_sistema.update({
        where: { id },
        data: {
          alumno_id: alumnoId,
          registro_completo: true, // 🔓 Acceso concedido
        },
        include: { alumnos: true } // 🛡️ VITAL: Para que GraphQL devuelva el objeto Alumno
      });
    });
  }

  // 🔍 BUSCAR UN USUARIO (Para el Home y el QR)
  async findOne(id: number) {
    const usuario = await this.prisma.usuarios_sistema.findUnique({
      where: { id },
      include: { 
        alumnos: true // 👈 Esto incluye carrera, semestre, etc.
      }
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  // 🔍 ESTADO RÁPIDO (Opcional, pero útil)
  async findOneStatus(id: number) {
    return this.findOne(id); // Reutilizamos findOne para que traiga todo
  }
}