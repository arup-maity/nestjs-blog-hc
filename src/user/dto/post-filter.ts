import { ApiProperty } from '@nestjs/swagger';
import {
   IsOptional,
   IsString,
   IsInt,
   IsPositive,
   IsIn,
} from 'class-validator';

export class ProfilePostFilterDto {
   @ApiProperty({
      description: 'Page number (starting from 1)',
      example: 1,
      required: false,
      default: 1,
   })
   @IsOptional()
   @IsInt()
   @IsPositive()
   page: number = 1;

   @ApiProperty({
      description: 'Number of items per page',
      example: 25,
      required: false,
      default: 25,
   })
   @IsOptional()
   @IsInt()
   @IsPositive()
   limit: number = 25;

   @ApiProperty({
      description: 'Search keyword',
      example: '',
      required: false,
      default: '',
   })
   @IsOptional()
   @IsString()
   search: string = '';

   @ApiProperty({
      description: 'Column to sort by',
      example: 'createdAt',
      required: false,
      default: 'createdAt',
   })
   @IsOptional()
   @IsString()
   sortColumn: string = 'createdAt';

   @ApiProperty({
      description: 'Sort order',
      example: 'desc',
      required: false,
      default: 'desc',
   })
   @IsOptional()
   @IsIn(['asc', 'desc'])
   sortOrder: string = 'desc';

   @ApiProperty({
      description: 'Type of the post',
      example: 'post',
      required: false,
      default: 'post',
   })
   @IsOptional()
   @IsString()
   type: string = 'post';

   @ApiProperty({
      description: 'Status of the post',
      example: 'all',
      required: false,
      default: 'all',
   })
   @IsOptional()
   @IsString()
   status: string = 'all';
}
