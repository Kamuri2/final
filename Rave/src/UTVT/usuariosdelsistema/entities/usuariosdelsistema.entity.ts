// En tu Machenike: src/usuariosdelsistema/entities/usuariosdelsistema.entity.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Alumno } from '../../alumnos/entities/alumno.entity'; // 👈 Importa la entidad Alumno

@ObjectType()
export class UsuarioSistema {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  @Field(() => Boolean)
  registro_completo: boolean;

  // 🛡️ ESTO ES LO QUE FALTA:
  @Field(() => Alumno, { nullable: true }) // 👈 Le decimos a GraphQL que esto existe
  alumnos?: Alumno; 
  @Field(() => Int)
  semestre: number;
  @Field(() => String)
  carrera: string;
  @Field(() => String)
  matricula: string;
  @Field(() => Int)
  userId: number;
}