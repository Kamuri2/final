import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Alumno } from '../../alumnos/entities/alumno.entity';

@ObjectType()
export class Credenciale {
  @Field(() => Int)
  id: number;

  @Field()
  qr_hash: string; // 🗝️ El identificador único del QR

  @Field()
  vencimiento: Date;

  @Field()
  estado: string; // 'ACTIVA', 'EXPIRADA', 'BLOQUEADA'

  @Field(() => Int, { nullable: true })
  alumno_id?: number;

  @Field(() => Alumno, { nullable: true })
  alumnos?: Alumno; // Para mostrar a quién pertenece la credencial
}