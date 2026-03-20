import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
 

  console.log('Creando roles de sistema...');
  const rolAdmin = await prisma.roles.upsert({
    where: { nombre_rol: 'Administrador' },
    update: {},
    create: { nombre_rol: 'Administrador' },
  });
  const rolAlumno = await prisma.roles.upsert({
    where: { nombre_rol: 'Alumno' },
    update: {},
    create: { nombre_rol: 'Alumno' },
  });
  const rolGuardia = await prisma.roles.upsert({
    where: { nombre_rol: 'Guardia' },
    update: {},
    create: { nombre_rol: 'Guardia' },
  });
  console.log(' Roles creados.\n');

  console.log(' Creando carreras...');
  const carreraDSM = await prisma.carreras.upsert({
    where: { clave: 'DSM' },
    update: {},
    create: { nombre: 'Desarrollo de Software Multiplataforma', clave: 'DSM' },
  });
  const carreraIRD = await prisma.carreras.upsert({
    where: { clave: 'IRD' },
    update: {},
    create: { nombre: 'Infraestructura de Redes Digitales', clave: 'IRD' },
  });
  console.log(' Carreras creadas.\n');

  await prisma.grupos.deleteMany(); 
  console.log('⏳ Creando grupos...');
  await prisma.grupos.createMany({
    data: [
      { nombre: 'DSM 52', semestre: 5, carrera_id: carreraDSM.id },
      { nombre: 'DSM 54', semestre: 5, carrera_id: carreraDSM.id },
      { nombre: 'IRD 52', semestre: 5, carrera_id: carreraIRD.id },
    ],
  });
  console.log(' Grupos creados.\n');

  console.log(' Creando departamentos...');
  const deptoSistemas = await prisma.departamentos.create({
    data: { nombre_depto: 'Sistemas y TI' },
  });
  await prisma.departamentos.create({
    data: { nombre_depto: 'Servicios Escolares' },
  });
  console.log(' Departamentos creados.\n');

  console.log(' Creando puntos de acceso...');
  await prisma.puntos_acceso.createMany({
    data: [
      { ubicacion: 'Entrada Principal - Torniquete 1', tipo: 'ENTRADA' },
      { ubicacion: 'Entrada Principal - Torniquete 2', tipo: 'SALIDA' },
      { ubicacion: 'Laboratorio de Cómputo B', tipo: 'AMBOS' },
    ],
  });
  console.log('Puntos de acceso creados.\n');

  console.log(' Creando usuario administrador por defecto...');
  const empleadoAdmin = await prisma.empleados.upsert({
    where: { num_empleado: 'ADMIN-001' },
    update: {},
    create: {
      num_empleado: 'ADMIN-001',
      nombre_completo: 'Administrador RavenID',
      depto_id: deptoSistemas.id,
    },
  });

  await prisma.usuarios_sistema.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'RavenAdmin',
      password: 'Kaoriko2', 
      rol_id: rolAdmin.id,
      empleado_id: empleadoAdmin.id,
    },
  });
  console.log(' Administrador creado (Usuario: admin, Pass: 123).\n');

  console.log(' ¡Siembra terminada!.');
}

//ORDEN DE ARRAQUE
main()
  .catch((e) => {
    console.error('Error fatal durante la siembra:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });