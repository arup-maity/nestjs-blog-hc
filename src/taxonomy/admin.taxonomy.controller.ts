import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { CreateTaxonomyType, UpdateTaxonomyType } from './taxonomy.validation';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('api/admin/taxonomy')
export class TaxonomyController {

   constructor(private readonly taxonomyService: TaxonomyService) { }

   @UseGuards(AuthGuard)
   @Post('create-taxonomy')
   async createTaxonomy(@Body() body: CreateTaxonomyType) {
      try {
         const taxonomy = await this.taxonomyService.createTaxonomy(body);
         return { success: true, taxonomy, message: 'Successfully created taxonomy' }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(AuthGuard)
   @Put('update-taxonomy/:id')
   async updateTaxonomy(@Param('id') id: string, @Body() body: UpdateTaxonomyType) {
      try {
         await this.taxonomyService.updateTaxonomy(id, body);
         return { success: true, message: 'Successfully updated taxonomy' }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(AuthGuard)
   @Get('read-taxonomy/:id')
   async taxonomyById(@Param('id') id: string) {
      try {
         const taxonomy = await this.taxonomyService.taxonomyById(id)
         return { success: true, taxonomy }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(AuthGuard)
   @Delete('delete-taxonomy/:id')
   async deleteTaxonomy(@Param('id') id: string) {
      try {
         const taxonomy = await this.taxonomyService.deleteTaxonomy(id)
         return { success: true, taxonomy }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(AuthGuard)
   @Get('taxonomies')
   async taxonomies(@Query() queryParameter) {
      try {
         const result = await this.taxonomyService.taxonomies(queryParameter);
         return { success: true, ...result }
      } catch (error) {
         throw error
      }
   }
}
