import { gql } from "@apollo/client";

export const GET_ALUMNO = gql`
  query getAlumnos {
    getAlumnos {
      id
      matricula
      nombre_completo
      grupo_id
      estado_academico
    }
  }
`;
export const GET_REGISTROS = gql`
  query GetRegistros {
    registrosAcceso {
      id
      fecha_hora
      concedido
      motivo_rechazo
      puntos_acceso {
        ubicacion
      }
      credenciales {
        alumnos {
          nombre_completo
          matricula
        }
      }
      pases_visita {
        visitantes {
          nombre_completo
        }
      }
    }
  }
`;