import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioSistemaInput } from './dto/create-usuariosdelsistema.input';
import { UpdateUsuarioSistemaInput } from './dto/update-usuariosdelsistema.input';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer'; // 📧 IMPORTANTE: Requiere "npm i nodemailer"

@Injectable()
export class UsuarioSistemaService {
  // 📧 Objeto para enviar correos reales
  private transporter;

  constructor(private prisma: PrismaService) {
    // ⚙️ CONFIGURACIÓN DE GMAIL (Reemplaza con tu correo y contraseña de aplicación)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kevin2.0bx@gmail.com', // 👈 Tu correo
        pass: 'ossi dhco ejga mpvu',         // 👈 Contraseña de aplicación (16 letras de Google)
      },
    });
  }

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

  // =========================================================================
  // 🏫 GESTIÓN ACADÉMICA (CARRERAS Y GRUPOS)
  // =========================================================================

  async findAllCarreras() {
    return this.prisma.carreras.findMany({ include: { grupos: true } });
  }

  async createCarrera(nombre: string) {
    return this.prisma.carreras.create({ data: { nombre, clave: 'TEMP' } });
  }

  async removeCarrera(id: number) {
    return this.prisma.carreras.delete({ where: { id } });
  }

  async createGrupo(nombre: string, carreraId: number) {
    return this.prisma.grupos.create({
      data: { nombre, carrera_id: carreraId, semestre: 1 },
    });
  }

  async removeGrupo(id: number) {
    return this.prisma.grupos.delete({ where: { id } });
  }
  // 📝 REGISTRO INICIAL
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
        email: data.email // 👈 Asegúrate de que el DTO también reciba el email
      },
    });
  }

  // 🛠️ ACTUALIZACIÓN DE FICHA
  async update(id: number, input: UpdateUsuarioSistemaInput) {
    return this.prisma.$transaction(async (tx) => {
      
      const usuario = await tx.usuarios_sistema.findUnique({ 
        where: { id },
        include: { alumnos: true } 
      });

      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      let alumnoId = usuario.alumno_id;

      if (!alumnoId) {
        // 🛡️ Caso: Perfil Nuevo
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
            grupo_id: input.grupo_id, 
            estado_academico: 'ACTIVO',
          },
        });
        alumnoId = nuevoAlumno.id;
      } else {
        // 🔄 Caso: Actualización 
        await tx.alumnos.update({
          where: { id: alumnoId },
          data: {
            nombre_completo: input.nombre_completo,
            matricula: input.matricula,
            carrera: input.carrera,
            semestre: input.semestre,
            grupo_id: input.grupo_id, 
          }
        });
      }

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

  // 🔍 BUSCAR UN USUARIO
  async findOne(id: number) {
    const usuario = await this.prisma.usuarios_sistema.findUnique({
      where: { id },
      include: { 
        alumnos: {
            include: { grupos: true }
        }
      }
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }
  //SECCION DE ACTUALIZACION DE CARRERAS Y GRUPOS
  async updateCarrera(id: number, nombre: string) {
  return this.prisma.carreras.update({
    where: { id },
    data: { nombre },
  });
}

async updateGrupo(id: number, nombre: string) {
  return this.prisma.grupos.update({
    where: { id },
    data: { nombre },
  });
}
  // =========================================================================
  // 🔥 NUEVA SECCIÓN: RECUPERACIÓN DE CONTRASEÑA VÍA CORREO (OTP)
  // =========================================================================

  
  // 1️⃣ EL ALUMNO PIDE RECUPERAR SU CONTRASEÑA
  async solicitarRecuperacion(email: string) {
    const usuario = await this.prisma.usuarios_sistema.findUnique({ where: { email } });
    if (!usuario) throw new NotFoundException('No existe una cuenta vinculada a este correo electrónico.');

    // Generar un PIN de 6 dígitos aleatorio
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // El código caduca en 15 minutos
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 15);

    // Guardar el PIN en la BD
    await this.prisma.usuarios_sistema.update({
      where: { email },
      data: { reset_pin: pin, reset_pin_expira: expiracion }
    });

    // 📩 ENVIAR EL CORREO REAL
    try {
      await this.transporter.sendMail({
        from: '"Seguridad RavenID" <tu_correo_ravenid@gmail.com>',
        to: email,
        subject: 'Código de Recuperación - RavenID UTVT',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 30px; text-align: center; background-color: #f9f9f9;">
            <h2 style="color: #4A724D; margin-bottom: 20px;">Recuperación de Acceso</h2>
            <p style="font-size: 16px; color: #333;">Hola <b>${usuario.username}</b>, se ha solicitado un cambio de contraseña para tu cuenta.</p>
            <p style="font-size: 16px; color: #333;">Ingresa el siguiente PIN de seguridad en la aplicación:</p>
            <div style="background-color: #E6FFF0; border: 2px dashed #84DCC6; padding: 15px; margin: 30px auto; width: 250px; border-radius: 10px;">
                <h1 style="color: #2A4A33; letter-spacing: 8px; margin: 0; font-size: 32px;">${pin}</h1>
            </div>
            <p style="color: #888; font-size: 13px; margin-top: 20px;">⏱️ Este código caduca en 15 minutos.</p>
            <p style="color: #888; font-size: 11px; margin-top: 30px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
          </div>
        `,
      });
      return "Se ha enviado un código de seguridad a tu correo electrónico.";
    } catch (error) {
      console.log("Error de Nodemailer:", error);
      throw new BadRequestException("Hubo un error al intentar enviar el correo. Revisa tu conexión a internet o los datos del servidor.");
    }
  }

  // 2️⃣ EL ALUMNO INGRESA EL PIN Y SU NUEVA CONTRASEÑA
  async resetearPasswordConPin(email: string, pin: string, nuevaPassword: string) {
    const usuario = await this.prisma.usuarios_sistema.findUnique({ where: { email } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // 🛡️ Validar existencia y coincidencia del PIN
    if (!usuario.reset_pin || usuario.reset_pin !== pin) {
      throw new UnauthorizedException('El código PIN es incorrecto.');
    }

    // ⏱️ Validar que el PIN exista y siga vivo
    if (!usuario.reset_pin_expira || new Date() > usuario.reset_pin_expira) {
      throw new UnauthorizedException('El código PIN ha caducado. Por favor, solicita uno nuevo.');
    }

    // 🔐 Hashear la nueva contraseña
    const passwordHasheada = await bcrypt.hash(nuevaPassword, 10);

    // ✅ Guardar la nueva contraseña y BORRAR el PIN por seguridad
    await this.prisma.usuarios_sistema.update({
      where: { email },
      data: {
        password: passwordHasheada,
        reset_pin: null,
        reset_pin_expira: null
      }
    });

    return "Tu contraseña se ha restablecido con éxito. Ya puedes iniciar sesión en RavenID.";
  }
}