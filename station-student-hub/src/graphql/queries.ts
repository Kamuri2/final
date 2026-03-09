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
