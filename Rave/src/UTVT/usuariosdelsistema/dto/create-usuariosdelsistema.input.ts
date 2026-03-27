import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

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

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  registro_completo?: boolean; 
  
}