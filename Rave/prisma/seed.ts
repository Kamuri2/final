import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- 🌱 Iniciando Siembra de RavenID (Estrictamente Funcional) ---');

  // ==========================================
  // 1. ROLES (1: ADMIN, 2: ALUMNO, 3: PROFESOR, 4: ADMINISTRATIVO)
  // ==========================================
  console.log('Configurando roles...');
  const rolesData = [
    { nombre_rol: 'ADMIN' },
    { nombre_rol: 'ALUMNO' },
    { nombre_rol: 'PROFESOR' },
    { nombre_rol: 'ADMINISTRATIVO' }
  ];

  for (const rol of rolesData) {
    await prisma.roles.upsert({
      where: { nombre_rol: rol.nombre_rol },
      update: {},
      create: rol,
    });
  }

  // ==========================================
  // 2. CARRERAS (Las 13 oficiales)
  // ==========================================
  console.log('Configurando carreras oficiales...');
  const carrerasData = [
    { nombre: 'Ingeniería en Logística Aeroportuaria', clave: 'LOG_AERO' },
    { nombre: 'Ingeniería Ferroviaria', clave: 'FERRO' },
    { nombre: 'Ingeniería en Mecatrónica', clave: 'MEC' },
    { nombre: 'Ingeniería en Mantenimiento Industrial', clave: 'MANT_IND' },
    { nombre: 'Ingeniería en Mecatrónica (Mixto)', clave: 'MEC_MIX' },
    { nombre: 'Licenciatura en Negocios y Mercadotecnia', clave: 'NEG_MERC' },
    { nombre: 'Ingeniería en Tecnologías de la Información e Innovación Digital', clave: 'TICS' },
    { nombre: 'Licenciatura en Negocios y Mercadotecnia (Mixto)', clave: 'NEG_MIX' },
    { nombre: 'Ingeniería Industrial', clave: 'IND' },
    { nombre: 'Ingeniería Ambiental y Sustentabilidad', clave: 'AMB_SUST' },
    { nombre: 'Licenciatura en Protección Civil', clave: 'PROT_CIV' },
    { nombre: 'Licenciatura en Enfermería', clave: 'ENF' },
    { nombre: 'Licenciatura en Administración', clave: 'ADMIN' }
  ];

  for (const carrera of carrerasData) {
    await prisma.carreras.upsert({
      where: { clave: carrera.clave },
      update: { nombre: carrera.nombre },
      create: carrera,
    });
  }

  // ==========================================
  // 3. GRUPOS (Exclusivo de TICS - Sin borrar para evitar P2003)
  // ==========================================
  console.log('Configurando grupos de TICS...');
  
  const carreraTics = await prisma.carreras.findUnique({
    where: { clave: 'TICS' }
  });

  if (carreraTics) {
    const gruposTics = [
      { nombre: 'DSM52', semestre: 5 },
      { nombre: 'DSM54', semestre: 5 },
      { nombre: 'DSM55', semestre: 5 },
      { nombre: 'IRD21', semestre: 2 },
      { nombre: 'IRD24', semestre: 2 }
    ];

    for (const grupo of gruposTics) {
      const existeGrupo = await prisma.grupos.findFirst({
        where: { nombre: grupo.nombre, carrera_id: carreraTics.id }
      });

      if (!existeGrupo) {
        await prisma.grupos.create({
          data: {
            nombre: grupo.nombre,
            semestre: grupo.semestre,
            carrera_id: carreraTics.id
          }
        });
      }
    }
  }

  // ==========================================
  // 4. DEPARTAMENTOS Y PUNTOS DE ACCESO (Base)
  // ==========================================
  console.log('Configurando infraestructura física...');
  let deptoSistemas = await prisma.departamentos.findFirst({
    where: { nombre_depto: 'Sistemas y TI' }
  });

  if (!deptoSistemas) {
    deptoSistemas = await prisma.departamentos.create({
      data: { nombre_depto: 'Sistemas y TI' }
    });
  }

  const puntosAcceso = [
    { ubicacion: 'Entrada Principal - Torniquete 1', tipo: 'ENTRADA' },
    { ubicacion: 'Laboratorio Cómputo B', tipo: 'AMBOS' }
  ];

  for (const punto of puntosAcceso) {
    const existePunto = await prisma.puntos_acceso.findFirst({
      where: { ubicacion: punto.ubicacion }
    });

    if (!existePunto) {
      await prisma.puntos_acceso.create({
        data: punto
      });
    }
  }

  // ==========================================
  // 5. USUARIO ADMINISTRADOR ÚNICO
  // ==========================================
  console.log('Creando Administrador maestro...');
  const rolAdmin = await prisma.roles.findUnique({ where: { nombre_rol: 'ADMIN' } });
  
  const empleadoAdmin = await prisma.empleados.upsert({
    where: { num_empleado: 'ADMIN-001' },
    update: {},
    create: {
      num_empleado: 'ADMIN-001',
      nombre_completo: 'Admin RavenID',
      depto_id: deptoSistemas.id,
    },
  });

  // 🔒 Encriptación de la contraseña del Admin
  const saltRounds = 10;
  const adminHashedPassword = await bcrypt.hash('Kaoriko2', saltRounds);

  await prisma.usuarios_sistema.upsert({
    where: { username: 'RavenAdmin' },
    update: {
      password: adminHashedPassword, // Actualiza a la versión encriptada si ya existe
      email: 'kevin2.0bx@gmail.com',
    },
    create: {
      username: 'RavenAdmin',
      password: adminHashedPassword, // Crea con la versión encriptada
      rol_id: rolAdmin!.id,
      empleado_id: empleadoAdmin.id,
      registro_completo: true,
      email: 'kevin2.0bx@gmail.com',
    },
  });

  console.log('\n✅ ¡Siembra funcional terminada de forma segura!');
  console.log('🔐 Admin: RavenAdmin / Kaoriko2 (Protegido con Hash)');
}

main()
  .catch((e) => {
    console.error('❌ Error en la siembra:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });