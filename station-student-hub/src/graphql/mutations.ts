import { gql } from "@apollo/client";

// Mutación para iniciar sesión (Esta se queda igual, está perfecta)
export const LOGIN_USUARIO = gql`
mutation LoginUsuario($username: String!, $password: String!) {
  loginUsuario(username: $username, password: $password) {
    token
    rol
  }
}
`;

export const CREATE_ALUMNO = gql`
  mutation CreateAlumno($createAlumnoInput: CreateAlumnoInput!) {
    createAlumno(createAlumnoInput: $createAlumnoInput) {
      id
      matricula
      nombre_completo
      grupo_id
      estado_academico
    }
  }
`;

export const UPDATE_ALUMNO = gql`
  mutation updateAlumno($updateAlumnoInput: UpdateAlumnoInput!) {
    updateAlumno(updateAlumnoInput: $updateAlumnoInput) {
      id  
      matricula
      nombre_completo
      grupo_id
      estado_academico
    }
  }
`;

export const REMOVE_ALUMNO = gql`
  mutation removeAlumno($id: Int!) {
    removeAlumno(id: $id) {
      id
    }
  }
`;  
export const Create_Carrera = gql`
  mutation createCarrera($createCarreraInput: CreateCarreraInput!) {
    createCarrera(createCarreraInput: $createCarreraInput) {  
      id
      nombre_carrera
    } 
  }
`;
export const UPDATE_CARRERA = gql`
  mutation updateCarrera($updateCarreraInput: UpdateCarreraInput!) {
    updateCarrera(updateCarreraInput: $updateCarreraInput) {
      id
      nombre_carrera
    } 
  }
`;
export const REMOVE_CARRERA = gql`
  mutation removeCarrera($id: Int!) {
    removeCarrera(id: $id) {
      id
    }   
  }
`;
export const CREATE_CREDENCIAL = gql`
  mutation createCredencial($createCredencialInput: CreateCredencialInput!) {
    createCredencial(createCredencialInput: $createCredencialInput) { 
      id
      alumno_id
      fecha_emision
      fecha_expiracion
      estado_credencial
    }
  } 
`;
export const UPDATE_CREDENCIAL = gql`
  mutation updateCredencial($updateCredencialInput: UpdateCredencialInput!) {
    updateCredencial(updateCredencialInput: $updateCredencialInput) {
      id
      alumno_id
      fecha_emision
      fecha_expiracion
      estado_credencial
    }
  }
`;
export const REMOVE_CREDENCIAL = gql`
  mutation removeCredencial($id: Int!) {
    removeCredencial(id: $id) {
      id
    }
  }
`;  
export const CREATE_DEPARTAMENTO = gql`
  mutation createDepartamento($createDepartamentoInput: CreateDepartamentoInput!) {
    createDepartamento(createDepartamentoInput: $createDepartamentoInput) { 
      id
      nombre_departamento
    }
  }
`;
export const UPDATE_DEPARTAMENTO = gql`
  mutation updateDepartamento($updateDepartamentoInput: UpdateDepartamentoInput!) {
    updateDepartamento(updateDepartamentoInput: $updateDepartamentoInput) {
      id
      nombre_departamento
    } 
  }
`;
export const REMOVE_DEPARTAMENTO = gql`
  mutation removeDepartamento($id: Int!) {
    removeDepartamento(id: $id) {
      id
    } 
  }
`;
export const CREATE_EMPLEADO = gql`
  mutation createEmpleado($createEmpleadoInput: CreateEmpleadoInput!) {
    createEmpleado(createEmpleadoInput: $createEmpleadoInput) { 
      id
      nombre_completo
      departamento_id
    } 
  }
`;
export const UPDATE_EMPLEADO = gql`
  mutation updateEmpleado($updateEmpleadoInput: UpdateEmpleadoInput!) {
    updateEmpleado(updateEmpleadoInput: $updateEmpleadoInput) {     
      id
      nombre_completo
      departamento_id
    }
  }
`;
export const REMOVE_EMPLEADO = gql`
  mutation removeEmpleado($id: Int!) {
    removeEmpleado(id: $id) {
      id
      }
  }
`;
export const CREATE_GRUPO = gql`
  mutation createGrupo($createGrupoInput: CreateGrupoInput!) {
    createGrupo(createGrupoInput: $createGrupoInput) {
      id
      nombre_grupo
      carrera_id
    } 
  }
`;
export const UPDATE_GRUPO = gql`
  mutation updateGrupo($updateGrupoInput: UpdateGrupoInput!) {
    updateGrupo(updateGrupoInput: $updateGrupoInput) {  
      id
      nombre_grupo
      carrera_id
    }
  }
`;
export const REMOVE_GRUPO = gql`
  mutation removeGrupo($id: Int!) {
    removeGrupo(id: $id) {
      id  
    }
  }
`; 
export const CREATE_HORARIO = gql`
  mutation createHorario($createHorarioInput: CreateHorarioInput!) {
    createHorario(createHorarioInput: $createHorarioInput) {
      id
      dia_semana
      hora_entrada
      hora_salida
      grupo_id
    } 
  }
`;
export const UPDATE_HORARIO = gql`
  mutation updateHorario($updateHorarioInput: UpdateHorarioInput!) {
    updateHorario(updateHorarioInput: $updateHorarioInput) {  
      id
      dia_semana
      hora_entrada
      hora_salida
      grupo_id
    }
  }
`;
export const REMOVE_HORARIO = gql`
  mutation removeHorario($id: Int!) {
    removeHorario(id: $id) {  
      id
      }
  }
`;
export const CREATE_PASE_VISITA = gql`
  mutation createPaseVisita($createPaseVisitaInput: CreatePaseVisitaInput!) {
    createPaseVisita(createPaseVisitaInput: $createPaseVisitaInput) {
      id
      visitante_nombre
      visitante_motivo
      fecha_hora_visita
      empleado_id
    }
  }
`;
export const UPDATE_PASE_VISITA = gql`
  mutation updatePaseVisita($updatePaseVisitaInput: UpdatePaseVisitaInput!) {
    updatePaseVisita(updatePaseVisitaInput: $updatePaseVisitaInput) {
      id
      visitante_nombre
      visitante_motivo
      fecha_hora_visita
      empleado_id
    }
  }
`;
export const REMOVE_PASE_VISITA = gql`
  mutation removePaseVisita($id: Int!) {
    removePaseVisita(id: $id) {
      id
    } 
  } 
`;
export const CREATE_PUNTO_ACCESO = gql`
  mutation createPuntoAcceso($createPuntoAccesoInput: CreatePuntoAccesoInput!) {
    createPuntoAcceso(createPuntoAccesoInput: $createPuntoAccesoInput) {
      id
      nombre_punto
      ubicacion
    }
  }
`;
export const UPDATE_PUNTO_ACCESO = gql`
  mutation updatePuntoAcceso($updatePuntoAccesoInput: UpdatePuntoAccesoInput!) {
    updatePuntoAcceso(updatePuntoAccesoInput: $updatePuntoAccesoInput) {
      id
      nombre_punto
      ubicacion
    }
  }
`;  
export const REMOVE_PUNTO_ACCESO = gql`
  mutation removePuntoAcceso($id: Int!) {
    removePuntoAcceso(id: $id) {
      id
    }
  }
`;
export const CREATE_REGISTRO_ACCESO = gql`
  mutation createRegistroAcceso($createRegistroAccesoInput: CreateRegistroAccesoInput!) {
    createRegistroAcceso(createRegistroAccesoInput: $createRegistroAccesoInput) {
      id
      fecha_hora
      concedido
      motivo_rechazo
      punto_id
      usuario_id
    }
  }
`;
export const UPDATE_REGISTRO_ACCESO = gql`
  mutation updateRegistroAcceso($updateRegistroAccesoInput: UpdateRegistroAccesoInput!) {
    updateRegistroAcceso(updateRegistroAccesoInput: $updateRegistroAccesoInput) {
      id
      fecha_hora
      concedido
      motivo_rechazo
      punto_id
      usuario_id
    }
  }
`;
export const REMOVE_REGISTRO_ACCESO = gql`
  mutation removeRegistroAcceso($id: Int!) {
    removeRegistroAcceso(id: $id) {
      id
    }
  }
`;
export const CREATE_ROL = gql`
  mutation createRol($createRolInput: CreateRolInput!) {
    createRol(createRolInput: $createRolInput) {  
      id
      nombre_rol
    }
  }
`;
export const UPDATE_ROL = gql`
  mutation updateRol($updateRolInput: UpdateRolInput!) {
    updateRol(updateRolInput: $updateRolInput) {
      id
      nombre_rol
    }
  }
`;  
export const REMOVE_ROL = gql`
  mutation removeRol($id: Int!) {
    removeRol(id: $id) {  
      id  
    }
  }
`;
export const CREATE_SANCION = gql`
  mutation createSancion($createSancionInput: CreateSancionInput!) {
    createSancion(createSancionInput: $createSancionInput) {
      id
      motivo
      bloquea_acceso
      alumno_id
    } 
  }
`;
export const UPDATE_SANCION = gql`
  mutation updateSancion($updateSancionInput: UpdateSancionInput!) {
    updateSancion(updateSancionInput: $updateSancionInput) {
      id
      motivo
      bloquea_acceso
      alumno_id
    }
  }
`;  
export const REMOVE_SANCION = gql`
  mutation removeSancion($id: Int!) {
    removeSancion(id: $id) {
      id
      motivo
      bloquea_acceso
      alumno_id
    }
  }
`;
export const CREATE_USUARIO_SISTEMA = gql`
  mutation createUsuarioSistema($createUsuarioSistemaInput: CreateUsuarioSistemaInput!) {
    createUsuarioSistema(createUsuarioSistemaInput: $createUsuarioSistemaInput) {
      id_usuario  
      username
      password
      rol
    }

  }
`;  
export const UPDATE_USUARIO_SISTEMA = gql`
  mutation updateUsuarioSistema($updateUsuarioSistemaInput: UpdateUsuarioSistemaInput!)
    {
    updateUsuarioSistema(updateUsuarioSistemaInput: $updateUsuarioSistemaInput) {
      id_usuario  
      username
      password
      rol
     }  
  }
`;
export const REMOVE_USUARIO_SISTEMA = gql`
  mutation removeUsuarioSistema($id_usuario: Int!) {
    removeUsuarioSistema(id_usuario: $id_usuario) {
      id_usuario  
      username
      password
      rol
     }  
}
`;
export const CREATE_VISITANTE = gql`
  mutation createVisitante($createVisitanteInput: CreateVisitanteInput!) {
    createVisitante(createVisitanteInput: $createVisitanteInput) {
      id
      nombre_completo
      motivo_visita
      fecha_hora_visita
    } 
  }
`;
export const UPDATE_VISITANTE = gql`
  mutation updateVisitante($updateVisitanteInput: UpdateVisitanteInput!) {
    updateVisitante(updateVisitanteInput: $updateVisitanteInput) {
      id
      nombre_completo
      motivo_visita
      fecha_hora_visita
    } 
  }
`;  
export const REMOVE_VISITANTE = gql`
  mutation removeVisitante($id: Int!) {
    removeVisitante(id: $id) {    
      id  
      nombre_completo
      motivo_visita
      fecha_hora_visita
     }
  }
`;  