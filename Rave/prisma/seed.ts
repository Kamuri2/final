import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Siembra de RavenID en la Machenike ---');

  // 1. ROLES
  console.log('Creando roles...');
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

  // 2. CARRERAS
  console.log('Creando carreras...');
  const dsm = await prisma.carreras.upsert({
    where: { clave: 'DSM' },
    update: {},
    create: { nombre: 'Desarrollo de Software Multiplataforma', clave: 'DSM' },
  });
  const ird = await prisma.carreras.upsert({
    where: { clave: 'IRD' },
    update: {},
    create: { nombre: 'Infraestructura de Redes Digitales', clave: 'IRD' },
  });

  // 3. GRUPOS (Limpiamos y creamos para evitar duplicados de ID)
  console.log('Configurando grupos...');
  await prisma.grupos.deleteMany(); 
  const grupo52 = await prisma.grupos.create({
    data: { nombre: 'DSM 52', semestre: 5, carrera_id: dsm.id },
  });

  // 4. DEPARTAMENTOS
  console.log('Creando departamentos...');
  const deptoSistemas = await prisma.departamentos.upsert({
    where: { id: 1 }, // Usamos ID para el upsert de depto
    update: {},
    create: { id: 1, nombre_depto: 'Sistemas y TI' },
  });

  // 5. PUNTOS DE ACCESO
  console.log('Configurando puntos de entrada...');
  await prisma.puntos_acceso.deleteMany();
  await prisma.puntos_acceso.createMany({
    data: [
      { ubicacion: 'Entrada Principal - Torniquete 1', tipo: 'ENTRADA' },
      { ubicacion: 'Laboratorio Cómputo B', tipo: 'AMBOS' },
    ],
  });

  // 6. USUARIO ADMINISTRADOR (CON ACCESO TOTAL)
  console.log('Creando Administrador maestro...');
  const empleadoAdmin = await prisma.empleados.upsert({
    where: { num_empleado: 'ADMIN-001' },
    update: {},
    create: {
      num_empleado: 'ADMIN-001',
      nombre_completo: 'Admin RavenID',
      depto_id: deptoSistemas.id,
    },
  });

  await prisma.usuarios_sistema.upsert({
    where: { username: 'RavenAdmin' },
    update: {},
    create: {
      username: 'RavenAdmin',
      password: 'Kaoriko2', 
      rol_id: rolAdmin.id,
      empleado_id: empleadoAdmin.id,
      registro_completo: true, // 🔓 El admin entra con el switch activado
    },
  });

  // 7. USUARIO ALUMNO DE PRUEBA (BLOQUEADO INICIALMENTE)
  console.log('Creando alumno de prueba...');
  await prisma.usuarios_sistema.upsert({
    where: { username: '20210345' },
    update: {},
    create: {
      username: '20210345',
      password: 'password123',
      rol_id: rolAlumno.id,
      registro_completo: false, // 🔒 Este alumno verá el botón GRIS hasta llenar el formulario
    },
  });

  console.log('\n¡Siembra terminada con éxito!');
  console.log('Admin: RavenAdmin / Kaoriko2');
  console.log('Alumno Test: 20210345 / password123');
}

main()
  .catch((e) => {
    console.error('Error en la siembra:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });