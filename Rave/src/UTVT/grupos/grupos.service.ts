import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGrupoInput } from './dto/create-grupo.input';

@Injectable()
export class GruposService {
  constructor(private prisma: PrismaService) {}

  async create(createGrupoInput: CreateGrupoInput) {
    return this.prisma.grupos.create({
      data: createGrupoInput,
      include: { carreras: true } // Para que devuelva los datos de la carrera de una vez
    });
  }
async findOne(id: number) {
    return this.prisma.grupos.findUnique({
      where: { id },
      include: { carreras: true } // Para que devuelva los datos de la carrera de una vez
    });
  }
  async remove(id: number) {  
    return this.prisma.grupos.delete({ where: { id } });
  }
  async update(id: number, updateGrupoInput: any) { 
    return this.prisma.grupos.update({
      where: { id },
      data: updateGrupoInput,
      include: { carreras: true } // Para que devuelva los datos de la carrera de una vez
    });
  }
  async findAll() {
    return this.prisma.grupos.findMany({
      include: { 
        carreras: true,
        _count: { select: { alumnos: true } } // dirá cuántos alumnos hay por grupo
      },
      orderBy: { nombre: 'asc' }
    });
  }
}