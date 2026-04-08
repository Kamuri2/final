import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Alumno } from '../../alumnos/entities/alumno.entity'; 

@ObjectType()
export class UsuarioSistema {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  // NUEVO: El correo electrónico (Obligatorio para recuperar cuenta)
  @Field()
  email: string;

  @Field(() => Boolean)
  registro_completo: boolean;

  @Field(() => Int, { nullable: true })
  alumno_id?: number;

  @Field(() => Alumno, { nullable: true })
  alumnos?: Alumno; 

  // NUEVOS: Campos para el PIN de recuperación
  // Los marcamos como nullable: true porque la mayor parte del tiempo estarán vacíos
  @Field({ nullable: true })
  reset_pin?: string;

  @Field({ nullable: true })
  reset_pin_expira?: Date;
}