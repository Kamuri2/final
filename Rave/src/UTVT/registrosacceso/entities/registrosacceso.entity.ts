import { ObjectType, Field, Int } from '@nestjs/graphql';
import { PuntoAcceso } from '../../puntosacceso/entities/puntosacceso.entity';
import { UsuarioSistema } from '../../usuariosdelsistema/entities/usuariosdelsistema.entity';

@ObjectType()
export class RegistroAcceso {
  
  @Field(() => Int)
  id: number;

  @Field()
  fecha_hora: Date;

  @Field()
  concedido: boolean; 

  @Field({ nullable: true })
  motivo_rechazo?: string;

  @Field(() => Int)
  punto_id: number;

  @Field(() => Int)
  usuario_id: number;

  
  @Field(() => PuntoAcceso, { nullable: true })
  puntos_acceso: PuntoAcceso;

  @Field(() => UsuarioSistema, { nullable: true })
  usuarios_sistema: UsuarioSistema;
}