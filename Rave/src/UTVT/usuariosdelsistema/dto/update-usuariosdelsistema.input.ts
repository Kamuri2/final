import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateUsuarioSistemaInput } from './create-usuariosdelsistema.input';
import { IsNotEmpty, IsInt, IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';

@InputType()
export class UpdateUsuarioSistemaInput extends PartialType(CreateUsuarioSistemaInput) {
  
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

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  grupo_id?: number; 

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  registro_completo?: boolean;

  // 📧 Validación agregada para el email
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo es inválido' })
  email?: string;
}