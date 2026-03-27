import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsString, IsOptional, IsBoolean } from 'class-validator'; // 👈 ¡ESTO ES LO QUE FALTABA!

@InputType()
export class UpdateUsuariosSistemaInput {
  @Field(() => Int)
  @IsInt() 
  id: number; // 🛡️ Ahora el validador aceptará el número que mandas desde el cel

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  nombre_completo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  matricula?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  carrera?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  semestre?: number; // 🔓 Ahora 'semestre' sí existe para NestJS

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  registro_completo?: boolean;
}