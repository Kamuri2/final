import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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

  @Field(() => Int, { nullable: true })
  @IsOptional()
  alumno_id?: number; 
}