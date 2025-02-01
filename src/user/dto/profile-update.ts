import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsObject, IsOptional, IsString } from 'class-validator';

export class ProfileUpdateDto {
   @ApiProperty({
      description: 'The name of the user.',
      example: 'User',
   })
   @IsString()
   name: string;

   @ApiProperty({
      description: 'The name of the user.',
      example: 'displayName',
   })
   @IsString()
   display_name: string;

   @ApiProperty({
      description: 'The email of the user.',
      example: 'email@example.com',
      required: false
   })
   @IsOptional()
   @IsEmail()
   @IsString()
   email: string;

   @ApiProperty({
      description: 'The username of the user.',
      example: 'username012',
   })
   @IsString()
   username: string;

   @ApiProperty({
      description: 'The pronouns of the user.',
      example: 'he/him',
      required: false
   })
   @IsOptional()
   @IsString()
   pronouns: string;

   @ApiProperty({
      description: 'The country name of the user.',
      example: 'india',
      required: false
   })
   @IsOptional()
   @IsString()
   country: string;

   @ApiProperty({
      description: 'The address of the user.',
      example: 'West Bengal',
      required: false
   })
   @IsOptional()
   @IsString()
   address: string;

   @ApiProperty({
      description: 'The bio of the user.',
      example: 'I am developer',
      required: false
   })
   @IsOptional()
   @IsString()
   bio: string;

   @ApiProperty({
      description: 'The about of the user.',
      example: 'I am developer with typeScript',
      required: false
   })
   @IsOptional()
   @IsString()
   about: string;

   @ApiProperty({
      description: 'The read book name of the user.',
      example: 'Python easy learn',
      required: false
   })
   @IsOptional()
   @IsString()
   good_reads: string;

   @ApiProperty({
      description: 'The social media of the user.',
      example: { facebook: 'link', twitter: 'link' },
      required: false
   })
   @IsOptional()
   @IsObject()
   social_media: string;
}