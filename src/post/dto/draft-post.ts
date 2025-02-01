import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsLowercase, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";


class Heading {
   @ApiProperty({ description: 'Heading ID', example: 'heading-1' })
   @IsString()
   id: string;

   @ApiProperty({ description: 'Heading content', example: 'something' })
   @IsString()
   content: string;
}

export class DraftPostDto {
   @ApiProperty({
      description: 'Post Id',
      example: 1,
      required: false,
   })
   @IsOptional()
   @IsString()
   id: string;

   @ApiProperty({
      description: 'Post Title',
      example: 'Post Title',
   })
   @IsString({ message: 'Title must be a string.' })
   @IsNotEmpty({ message: 'Title cannot be empty.' })
   title: string;

   @ApiProperty({
      description: 'Post Slug (lowercase, hyphen-separated)',
      example: 'post-slug',
      required: false,
   })
   @IsOptional()
   @IsString({ message: 'Slug must be a string.' })
   @IsLowercase({ message: 'Slug must be in lowercase.' })
   slug: string;

   @ApiProperty({
      description: 'Post Content',
      example: 'Post Content',
   })
   @IsString({ message: 'Content must be a string.' })
   @IsNotEmpty({ message: 'Content cannot be empty.' })
   content: string;

   @ApiProperty({
      description: 'Post Type (e.g., article)',
      example: 'article',
   })
   @IsString({ message: 'Type must be a string.' })
   @IsLowercase({ message: 'Type must be in lowercase.' })
   @IsNotEmpty({ message: 'Type cannot be empty.' })
   type: string;

   @ApiProperty({
      description: 'Meta Title (60-100 characters)',
      example: 'This is a sample meta title for the post.',
      required: false,
   })
   @IsOptional()
   @IsString({ message: 'Meta title must be a string.' })
   meta_title: string;

   @ApiProperty({
      description: 'Meta Description (160-200 characters)',
      example: 'This is a detailed meta description for the post. It provides a concise summary.',
      required: false,
   })
   @IsOptional()
   @IsString({ message: 'Meta description must be a string.' })
   meta_description: string;

   @ApiProperty({
      description: 'Thumbnail URL (optional)',
      example: 'https://example.com/thumbnail.jpg',
      required: false,
   })
   @IsOptional()
   @IsString({ message: 'Thumbnail URL must be a string.' })
   thumbnail: string;

   @ApiProperty({
      description: 'Post Headings List',
      example: [{ id: 'heading-1', content: 'something' }],
      required: false,
   })
   @IsOptional()
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => Heading)
   headings_list: Heading[];

   @ApiProperty({
      description: 'Post Categories (minimum one required)',
      example: [1, 2, 45],
      required: false,
   })
   @IsOptional()
   @IsArray({ message: 'Categories must be an array.' })
   @IsNumber({}, { each: true, message: 'Each category ID must be a number.' })
   @Type(() => Number)
   categories: number[];
}