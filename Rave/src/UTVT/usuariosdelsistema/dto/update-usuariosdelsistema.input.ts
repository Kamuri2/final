import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateUsuarioSistemaInput } from './create-usuariosdelsistema.input';
import { IsNotEmpty, IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';

@InputType()
export class UpdateUsuarioSistemaInput extends PartialType(CreateUsuarioSistemaInput) {
  
  // 🆔 El ID es OBLIGATORIO para saber a quién actualizar
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  nombre_completo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  matricula?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  carrera?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  semestre?: number;

  // 🏫 AUTORIZADO: Ahora sí, el pasaporte para el grupo está sellado
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  grupo_id?: number; 

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  registro_completo?: boolean;
}