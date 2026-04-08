import { ObjectType, Field } from '@nestjs/graphql';
import { Alumno } from '../../alumnos/entities/alumno.entity'; // Asegúrate de importar tu entidad Alumno

@ObjectType()
export class ValidacionResult {
  @Field(() => Boolean)
  valido: boolean;

  @Field(() => String)
  mensaje: string;

  @Field(() => Alumno, { nullable: true }) // SIN ESTO, la web no verá al alumno
  alumno?: Alumno;
}