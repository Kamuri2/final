import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';

@InputType()
export class CreateCredencialeInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  qr_hash: string; // En el futuro, esto se generará automáticamente

  @Field()
  @IsNotEmpty()
  @IsDate()
  vencimiento: Date;

  @Field({ defaultValue: 'ACTIVA' })
  @IsOptional()
  estado?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  alumno_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  empleado_id?: number;
}