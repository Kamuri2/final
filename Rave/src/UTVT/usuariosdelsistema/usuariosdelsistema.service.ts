import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioSistemaInput } from './dto/create-usuariosdelsistema.input';
import { UpdateUsuarioSistemaInput } from './dto/update-usuariosdelsistema.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioSistemaService {
  constructor(private prisma: PrismaService) {}

  // 🔐 LOGIN (Seguro con Bcrypt)
  async loginUsuario(username: string, password: string) {
    const usuario = await this.prisma.usuarios_sistema.findFirst({
      where: { username },
    });

    if (!usuario) {
      throw new UnauthorizedException('Datos incorrectos');
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Datos incorrectos');
    }

    // Retornamos el ID real para que el celular sepa quién es quién
    return {
      token: 'TOKEN_REAL_' + usuario.username,
      rol: usuario.rol_id === 1 ? 'ADMIN' : 'ALUMNO',
      id: usuario.id 
    };
  }

  // 📝 REGISTRO INICIAL (Solo usuario y contraseña)
  async create(data: CreateUsuarioSistemaInput) {
    const existeUsuario = await this.prisma.usuarios_sistema.findUnique({
      where: { username: data.username }
    });

    if (existeUsuario) {
      throw new BadRequestException('Este usuario/matrícula ya tiene una cuenta registrada.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    return this.prisma.usuarios_sistema.create({
      data: {
        username: data.username,
        password: hashedPassword,
        rol_id: data.rol_id || 2, 
        registro_completo: false,
      },
    });
  }

  // 🛠️ ACTUALIZACIÓN DE FICHA (El Corazón de RavenID)
  async update(id: number, input: UpdateUsuarioSistemaInput) {
    return this.prisma.$transaction(async (tx) => {
      
      // 1. Buscamos al usuario y su vínculo con la tabla alumnos
      const usuario = await tx.usuarios_sistema.findUnique({ 
        where: { id },
        include: { alumnos: true } 
      });

      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      let alumnoId = usuario.alumno_id;

      // 2. CREAR O ACTUALIZAR EXPEDIENTE DE ALUMNO
      if (!alumnoId) {
        // 🛡️ Caso: Perfil Nuevo (Primera vez que llena el formulario)
        const existeMatricula = await tx.alumnos.findUnique({
          where: { matricula: input.matricula }
        });

        if (existeMatricula) {
           throw new BadRequestException('Esta matrícula ya está asignada a otro expediente.');
        }

        const nuevoAlumno = await tx.alumnos.create({
          data: {
            nombre_completo: input.nombre_completo!,
            matricula: input.matricula!,
            carrera: input.carrera,
            semestre: input.semestre,
            grupo_id: input.grupo_id, // ✅ USAMOS EL DATO REAL DEL CELULAR
            estado_academico: 'ACTIVO',
          },
        });
        alumnoId = nuevoAlumno.id;
      } else {
        // 🔄 Caso: Actualización (Ya tenía datos pero los está cambiando)
        await tx.alumnos.update({
          where: { id: alumnoId },
          data: {
            nombre_completo: input.nombre_completo,
            matricula: input.matricula,
            carrera: input.carrera,
            semestre: input.semestre,
            grupo_id: input.grupo_id, // ✅ ACTUALIZAMOS EL GRUPO TAMBIÉN
          }
        });
      }

      // 3. ACTUALIZAMOS EL STATUS DEL USUARIO
      // Esto marca el 'registro_completo' como TRUE para que el QR se libere
      return tx.usuarios_sistema.update({
        where: { id },
        data: {
          alumno_id: alumnoId,
          registro_completo: true, 
        },
        include: { alumnos: true }
      });
    });
  }

  // 🔍 BUSCAR UN USUARIO (Para el Home y generación de QR)
  async findOne(id: number) {
    const usuario = await this.prisma.usuarios_sistema.findUnique({
      where: { id },
      include: { 
        alumnos: {
            include: {
                grupos: true // 👈 Incluimos el nombre del grupo para el Home
            }
        }
      }
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }
}