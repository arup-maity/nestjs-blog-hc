import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaxonomyType {
   @ApiProperty({
      description: 'The name of the taxonomy type.',
      example: 'Category Name',
   })
   @IsString()
   name: string;

   @ApiProperty({
      description: 'The slug of the taxonomy type.',
      example: 'category-name',
   })
   @IsString()
   slug: string;

   @ApiProperty({
      description: 'The description of the taxonomy type.',
      example: 'This is a category taxonomy type.',
   })
   @IsOptional()
   @IsString()
   description: string;

   @ApiProperty({
      description: 'The image of the taxonomy type.',
      example: 'demo.jpg',
   })
   @IsOptional()
   @IsString()
   thumbnail: string;

   @ApiProperty({
      description: 'The parent ID of the taxonomy type.',
      example: null,
   })
   @IsOptional()
   @IsNumber()
   parentId: number;

   @ApiProperty({
      description: 'The taxonomy type. category or tag',
      example: 'category',
   })
   @IsString()
   type: string;

   @ApiProperty({
      description: 'The taxonomy post type. this taxonomy which for post type',
      example: 'article',
   })
   @IsString()
   post_type: string;

}

export class UpdateTaxonomyType {
   @ApiProperty({
      description: 'The name of the taxonomy type.',
      example: 'Category Name',
   })
   @IsString()
   name: string;

   @ApiProperty({
      description: 'The slug of the taxonomy type.',
      example: 'category-name',
   })
   @IsString()
   slug: string;

   @ApiProperty({
      description: 'The description of the taxonomy type.',
      example: 'This is a category taxonomy type.',
   })
   @IsOptional()
   @IsString()
   description: string;

   @ApiProperty({
      description: 'The image of the taxonomy type.',
      example: 'demo.jpg',
   })
   @IsOptional()
   @IsString()
   thumbnail: string;

   @ApiProperty({
      description: 'The parent ID of the taxonomy type.',
      example: null,
   })
   @IsOptional()
   @IsNumber()
   parentId: number;

   @ApiProperty({
      description: 'The taxonomy type. category or tag',
      example: 'category',
   })
   @IsOptional()
   @IsString()
   type: string;

   @ApiProperty({
      description: 'The taxonomy post type. this taxonomy which for post type',
      example: 'article',
   })
   @IsOptional()
   @IsString()
   post_type: string;

}