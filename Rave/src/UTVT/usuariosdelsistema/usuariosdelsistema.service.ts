import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioSistemaInput } from './dto/create-usuariosdelsistema.input';
import { UpdateUsuariosSistemaInput } from './dto/update-usuariosdelsistema.input';

@Injectable()
export class UsuarioSistemaService {
  [x: string]: any;
  constructor(private prisma: PrismaService) {}

  // 🚀 Este método quitará el error de 'loginUsuario'
  async loginUsuario(username: string, password: string) {
    return this.prisma.usuarios_sistema.findFirst({
      where: { username, password }
    });
  }

  // 🚀 Este quitará el error de 'findAll'
  async findAll() {
    return this.prisma.usuarios_sistema.findMany({ include: { roles: true } });
  }

  // 🚀 Este quitará el error de 'findOne'
  async findOne(id: number) {
    return this.prisma.usuarios_sistema.findUnique({ where: { id } });
  }

  // 🚀 Estos quitarán los de 'update' y 'remove'
  async update(id: number, data: any) {
    return this.prisma.usuarios_sistema.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.usuarios_sistema.delete({ where: { id } });
  }
}