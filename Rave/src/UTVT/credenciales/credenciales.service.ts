import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCredencialeInput } from './dto/create-credenciale.input';

@Injectable()
export class CredencialesService {
  constructor(private prisma: PrismaService) {}

  async create(createCredencialInput: CreateCredencialeInput) {
    return this.prisma.credenciales.create({
      data: createCredencialInput,
      include: { alumnos: true }
    });
  }
async findOne(id: number) {
    return this.prisma.credenciales.findUnique({ where: { id } });
  } 
  async remove(id: number) {
    return this.prisma.credenciales.delete({ where: { id } });
  } 
  async update(id: number, updateCredencialInput: any) {
    return this.prisma.credenciales.update({
      where: { id },  
      data: updateCredencialInput,
      include: { alumnos: true }
    });
  } 
  // Método clave para el escáner de la entrada
  async findByHash(qr_hash: string) {
    return this.prisma.credenciales.findUnique({
      where: { qr_hash },
      include: { 
        alumnos: {
          include: { grupos: true } // Para saber el grupo al momento del escaneo
        } 
      }
    });
  }

  async findAll() {
    return this.prisma.credenciales.findMany({
      include: { alumnos: true, empleados: true }
    });
  }
}