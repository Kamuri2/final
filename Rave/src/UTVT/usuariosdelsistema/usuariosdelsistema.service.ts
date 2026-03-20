import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioSistemaInput } from './dto/create-usuariosdelsistema.input';
import { UpdateUsuariosSistemaInput } from './dto/update-usuariosdelsistema.input';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class UsuarioSistemaService {
  //  JwtService en el constructor junto a Prisma
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService 
  ) {}

  async loginUsuario(username: string, password: string) {
    const usuario = await this.prisma.usuarios_sistema.findFirst({
      where: { username, password },
      include: { roles: true }
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const nombreRol = usuario.roles?.nombre_rol || 'Administrador';

    // Creamos el "payload" (los datos empaquetados dentro del token)
    const payload = { 
      sub: usuario.id, 
      username: usuario.username, 
      rol: nombreRol 
    };

    // Firmamos y generamos el token real
    const tokenReal = this.jwtService.sign(payload);

    // Devolvemos la respuesta para GraphQL y React
    return {
      token: tokenReal,
      rol: nombreRol,
    };
  }

  
  async findAll() {
    return this.prisma.usuarios_sistema.findMany({ include: { roles: true } });
  }

  
  async findOne(id: number) {
    return this.prisma.usuarios_sistema.findUnique({ where: { id } });
  }

  
  async update(id: number, data: any) {
    return this.prisma.usuarios_sistema.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.usuarios_sistema.delete({ where: { id } });
  }
  async create(data: CreateUsuarioSistemaInput) {
    return this.prisma.usuarios_sistema.create({ data });
  }
}