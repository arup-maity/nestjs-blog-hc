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

export class CreatePostDto {
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
   })
   @IsString({ message: 'Slug must be a string.' })
   @IsLowercase({ message: 'Slug must be in lowercase.' })
   @IsNotEmpty({ message: 'Slug cannot be empty.' })
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
      description: 'Post Status (e.g., published)',
      example: 'published',
   })
   @IsString({ message: 'Status must be a string.' })
   @IsLowercase({ message: 'Status must be in lowercase.' })
   @IsNotEmpty({ message: 'Status cannot be empty.' })
   status: string;

   @ApiProperty({
      description: 'Post Categories (minimum one required)',
      example: [1, 2, 45],
   })
   @IsArray({ message: 'Categories must be an array.' })
   @ArrayNotEmpty({ message: 'At least one category must be selected.' })
   @IsNumber({}, { each: true, message: 'Each category ID must be a number.' })
   @Type(() => Number)
   categories: number[];

   // @ApiProperty({
   //    description: 'Post Tags (optional)',
   //    example: [1, 2, 45],
   //    required: false
   // })
   // @IsOptional()
   // @IsArray({ message: 'Tags must be an array.' })
   // @ArrayNotEmpty({ message: 'Tags cannot be an empty array.' })
   // @IsNumber({}, { each: true, message: 'Each tag ID must be a number.' })
   // @Type(() => Number)
   // tags: number[];

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
      description: 'Meta Title (60-100 characters)',
      example: 'This is a sample meta title for the post.',
      required: false,
   })
   @IsString({ message: 'Meta title must be a string.' })
   @IsNotEmpty({ message: 'Meta title cannot be empty.' })
   meta_title: string;

   @ApiProperty({
      description: 'Meta Description (160-200 characters)',
      example: 'This is a detailed meta description for the post. It provides a concise summary.',
      required: false,
   })
   @IsString({ message: 'Meta description must be a string.' })
   @IsNotEmpty({ message: 'Meta description cannot be empty.' })
   meta_description: string;

   // @ApiProperty({
   //    description: 'Author ID',
   //    example: 123,
   // })
   // @IsNumber({}, { message: 'Author ID must be a number.' })
   // @IsNotEmpty({ message: 'Author ID cannot be empty.' })
   // authorId: number;

   @ApiProperty({
      description: 'Thumbnail URL (optional)',
      example: 'https://example.com/thumbnail.jpg',
      required: false,
   })
   @IsString({ message: 'Thumbnail URL must be a string.' })
   @IsOptional()
   thumbnail: string;

}
