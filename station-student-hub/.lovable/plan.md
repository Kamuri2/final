

## Plan: Sistema de Gestión de Alumnos — Estética Japonesa Minimalista

### Diseño Visual
- Paleta inspirada en señalética de estaciones japonesas: blancos limpios, negro tipográfico, verde pastel (#a8d5ba), grises industriales
- Tipografía sans-serif limpia, espaciado generoso, bordes sutiles
- Tarjetas con sombras mínimas, iconografía sencilla

### Estructura de Páginas

**1. Login (`/login`)**
- Campo de usuario y contraseña
- Conecta con mutation `loginUsuario` vía GraphQL
- Almacena token JWT en memoria/localStorage
- Redirige según rol (admin → `/admin`, alumno → `/alumno`)

**2. Panel Admin (`/admin`)**
- Ruta protegida (requiere autenticación)
- Formulario de registro de alumno con campos: matrícula, nombre completo, grupo (select), estado (select: activo/inactivo/baja)
- Ejecuta mutation `createAlumno` al enviar
- Feedback visual con toast de confirmación/error
- Validación de campos con Zod

**3. Vista Alumno (`/alumno`)**
- Campo de búsqueda por matrícula
- Ejecuta query `alumno(matricula)` al buscar
- Muestra tarjeta elegante con: nombre, grupo y estado académico
- Estado con badge de color (verde=activo, gris=inactivo, rojo=baja)

### Configuración Técnica
- Instalar `@apollo/client` y `graphql`
- Apollo Provider apuntando a `http://localhost:3000/graphql`
- Auth link para adjuntar JWT en headers
- Estructura de carpetas: `graphql/queries`, `graphql/mutations`, `components/`, `pages/`, `lib/`

### Componentes Clave
- `AuthProvider` — contexto de autenticación con token
- `ProtectedRoute` — wrapper para rutas que requieren login
- `AlumnoCard` — tarjeta de presentación del alumno estilo japonés
- `AdminForm` — formulario de registro con validación
- `LoginForm` — formulario de acceso

