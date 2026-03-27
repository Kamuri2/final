-- ==============================================================================
-- SCRIPT DE INICIALIZACIÓN PARA POSTGRESQL (DOCKER) - RAVEN ID ACTUALIZADO
-- ==============================================================================

-- 1. BLOQUE ACADÉMICO
CREATE TABLE carreras (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    clave VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE grupos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    semestre INT NOT NULL,
    carrera_id INT NOT NULL REFERENCES carreras(id) ON DELETE CASCADE
);

CREATE TABLE horarios (
    id SERIAL PRIMARY KEY,
    dia_semana VARCHAR(15) NOT NULL,
    hora_entrada TIME NOT NULL,
    hora_salida TIME NOT NULL,
    grupo_id INT NOT NULL REFERENCES grupos(id) ON DELETE CASCADE
);

CREATE TABLE alumnos (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    -- 🟢 Campos añadidos para el Formulario de la App
    carrera VARCHAR(100),
    semestre INT,
    -- grupo_id se hace opcional (NULL) para permitir registro inicial sin grupo asignado
    grupo_id INT REFERENCES grupos(id) ON DELETE RESTRICT,
    estado_academico VARCHAR(50) NOT NULL DEFAULT 'ACTIVO'
);

-- 2. BLOQUE PERSONAL / VISITAS
CREATE TABLE departamentos (
    id SERIAL PRIMARY KEY,
    nombre_depto VARCHAR(100) NOT NULL
);

CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    num_empleado VARCHAR(50) NOT NULL UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    depto_id INT NOT NULL REFERENCES departamentos(id) ON DELETE RESTRICT
);

CREATE TABLE visitantes (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    identificacion VARCHAR(100) NOT NULL,
    motivo VARCHAR(255) NOT NULL
);

-- 3. BLOQUE SISTEMA Y ACCESO (ROLES Y USUARIOS)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios_sistema (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    
    -- 🟢 INTERRUPTOR MAESTRO: Bloquea/Desbloquea el QR en la App
    registro_completo BOOLEAN DEFAULT FALSE,
    
    -- Relaciones 1:1
    alumno_id INT UNIQUE REFERENCES alumnos(id) ON DELETE CASCADE,
    empleado_id INT UNIQUE REFERENCES empleados(id) ON DELETE CASCADE,
    visitante_id INT UNIQUE REFERENCES visitantes(id) ON DELETE CASCADE,
    
    CONSTRAINT chk_un_solo_perfil CHECK (
        (alumno_id IS NOT NULL)::integer + 
        (empleado_id IS NOT NULL)::integer + 
        (visitante_id IS NOT NULL)::integer <= 1
    )
);

-- 4. CREDENCIALES, PASES Y SANCIONES
CREATE TABLE credenciales (
    id SERIAL PRIMARY KEY,
    qr_hash VARCHAR(255) NOT NULL UNIQUE,
    vencimiento DATE NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVA',
    
    alumno_id INT REFERENCES alumnos(id) ON DELETE CASCADE,
    empleado_id INT REFERENCES empleados(id) ON DELETE CASCADE,
    
    CONSTRAINT chk_titular_credencial CHECK (
        (alumno_id IS NOT NULL)::integer + 
        (empleado_id IS NOT NULL)::integer = 1
    )
);

CREATE TABLE pases_visita (
    id SERIAL PRIMARY KEY,
    qr_hash VARCHAR(255) NOT NULL UNIQUE,
    expiracion TIMESTAMP NOT NULL,
    visitante_id INT NOT NULL REFERENCES visitantes(id) ON DELETE CASCADE,
    autoriza_id INT NOT NULL REFERENCES usuarios_sistema(id) ON DELETE RESTRICT
);

CREATE TABLE sanciones (
    id SERIAL PRIMARY KEY,
    motivo VARCHAR(255) NOT NULL,
    bloquea_acceso BOOLEAN NOT NULL DEFAULT FALSE,
    alumno_id INT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE
);

-- 5. REGISTROS DE ACCESO
CREATE TABLE puntos_acceso (
    id SERIAL PRIMARY KEY,
    ubicacion VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL
);

CREATE TABLE registros_acceso (
    id SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    concedido BOOLEAN NOT NULL,
    motivo_rechazo VARCHAR(255),
    
    punto_id INT NOT NULL REFERENCES puntos_acceso(id) ON DELETE RESTRICT,
    usuario_id INT NOT NULL REFERENCES usuarios_sistema(id) ON DELETE RESTRICT,
    
    credencial_id INT REFERENCES credenciales(id) ON DELETE SET NULL,
    pase_id INT REFERENCES pases_visita(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_metodo_acceso CHECK (
        (credencial_id IS NOT NULL)::integer + 
        (pase_id IS NOT NULL)::integer <= 1
    )
);

-- ==============================================================================
-- INSERCIÓN DE DATOS INICIALES
-- ==============================================================================

-- Roles base
INSERT INTO roles (nombre_rol) VALUES ('Administrador');
INSERT INTO roles (nombre_rol) VALUES ('Alumno');

-- Usuario Administrador (registro_completo en TRUE porque es el admin)
INSERT INTO usuarios_sistema (username, password, rol_id, registro_completo) 
VALUES ('RavenAdmin', 'Kaoriko2', 1, TRUE);