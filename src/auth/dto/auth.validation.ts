import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AdminLoginDto {

   @ApiProperty({
      description: 'The email of the admin.',
      example: 'admin@example.com',
   })
   @IsEmail()
   @IsString()
   email: string;

   @ApiProperty({
      description: 'The password of the admin.',
      example: 'password123',
   })
   @IsString()
   password: string;

}

export class UserRegisterDto {

   @ApiProperty({
      description: 'The name of the user.',
      example: 'user',
   })
   @IsString()
   name: string;

   @ApiProperty({
      description: 'The email of the admin.',
      example: 'admin@example.com',
   })
   @IsEmail()
   @IsString()
   email: string;

   @ApiProperty({
      description: 'The password of the admin.',
      example: 'password123',
   })
   @IsString()
   password: string;

}