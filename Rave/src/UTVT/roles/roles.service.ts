import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // Lista todos los roles para el registro de usuarios
  async findAll() {
    return this.prisma.roles.findMany({
      orderBy: { id: 'asc' },
    });
  }
async create(createRoleInput: CreateRoleInput) {
    return this.prisma.roles.create({
      data: createRoleInput
    });
  }
  async update(id: number, updateRoleInput: any) {
    return this.prisma.roles.update({
      where: { id },  
      data: updateRoleInput,
    });
  }
  async remove(id: number) {
    return this.prisma.roles.delete({ where: { id } });
  }
    
  // Busca un rol específico por su ID
  async findOne(id: number) {
    return this.prisma.roles.findUnique({ where: { id } });
  }
}