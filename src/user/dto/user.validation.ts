
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsJSON, IsObject, IsOptional, IsString } from 'class-validator';

export class FilterQueryDto {
   @IsOptional()
   @IsString()
   page: string;

   @IsOptional()
   @IsString()
   limit: string;

   @IsOptional()
   @IsString()
   search: string;

   @IsOptional()
   @IsString()
   sortColumn: string;

   @IsOptional()
   @IsString()
   sortOrder: number;

   @IsOptional()
   @IsString()
   role: string
}


export class UpdateUserDto {
   @IsOptional()
   @IsString()
   name: string;

   @IsOptional()
   @IsString()
   email: string;

   @IsOptional()
   @IsString()
   username: string;

   @IsOptional()
   @IsString()
   role: string;

   @IsOptional()
   @IsString()
   isActive: string;
}

export class UserSchemaDto {
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
   })
   @IsOptional()
   @IsString()
   pronouns: string;

   @ApiProperty({
      description: 'The country name of the user.',
      example: 'india',
   })
   @IsOptional()
   @IsString()
   country: string;

   @ApiProperty({
      description: 'The address of the user.',
      example: 'West Bengal',
   })
   @IsOptional()
   @IsString()
   address: string;

   @ApiProperty({
      description: 'The bio of the user.',
      example: 'I am developer',
   })
   @IsOptional()
   @IsString()
   bio: string;

   @ApiProperty({
      description: 'The about of the user.',
      example: 'I am developer with typeScript',
   })
   @IsOptional()
   @IsString()
   about: string;

   @ApiProperty({
      description: 'The read book name of the user.',
      example: 'Python easy learn',
   })
   @IsOptional()
   @IsString()
   good_reads: string;

   @ApiProperty({
      description: 'The social media of the user.',
      example: { facebook: 'link', twitter: 'link' },
   })
   @IsOptional()
   @IsObject()
   social_media: string;
}

export class UserAuthorDto {
   @ApiProperty({
      description: 'motivation',
      example: 'motivation',
   })
   @IsString()
   motivation: string;

   @ApiProperty({
      description: 'topics',
      example: 'topics',
   })
   @IsString()
   topics: string;

   @ApiProperty({
      description: 'Category List',
      example: [{ label: 'Category Name', value: 'category Id' }],
   })
   @IsArray()
   categories: string;

   @ApiProperty({
      description: 'other_category',
      example: 'other_category',
   })
   @IsOptional()
   @IsString()
   other_category: string;

   @ApiProperty({
      description: 'previous_works',
      example: 'previous_works',
   })
   @IsOptional()
   @IsString()
   previous_works: string;

   @ApiProperty({
      description: 'work_file',
      example: 'work_file',
   })
   @IsOptional()
   @IsString()
   work_file: string;
}

export class UpdateBecomeAuthorDto {
   @ApiProperty({
      description: 'pending, approved, rejected',
      example: 'approved',
   })
   @IsString()
   status: string;

   @ApiProperty({
      description: 'Comment for why rejected',
      example: 'profile not matching',
   })
   @IsOptional()
   @IsString()
   reason: string;


}