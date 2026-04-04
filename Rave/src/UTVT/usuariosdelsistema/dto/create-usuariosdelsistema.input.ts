import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

@InputType()
export class CreateUsuarioSistemaInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  username: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  password: string; 

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  rol_id: number;
  
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nombre_completo?: string;   

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  matricula?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  carrera?: string;

  // 🎓 AGREGADO: Semestre (Vital para la ficha académica)
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  semestre?: number;

  // 🏫 AGREGADO: Grupo ID (Para que NestJS lo autorice desde el inicio)
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  grupo_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  registro_completo?: boolean; 
}