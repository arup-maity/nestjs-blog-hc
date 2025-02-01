import { Controller, Get, Param, Query } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';

@Controller('api/taxonomy')
export class PublicTaxonomyController {

   constructor(private readonly taxonomyService: TaxonomyService) { }

   @Get('post-taxonomies') // done
   async taxonomies(@Query() queryParameter) {
      const taxonomies = await this.taxonomyService.taxonomiesForPost(queryParameter);
      return { success: true, taxonomies }
   }

   @Get('public-taxonomy/:slug')
   async publicTaxonomy(@Param("slug") slug: string) {
      const taxonomies = await this.taxonomyService.taxonomyBySlug(slug);
      return { success: true, taxonomies }
   }

   @Get('taxonomies')
   async publicTaxonomies(@Query() queryParameter) {
      const taxonomies = await this.taxonomyService.taxonomies(queryParameter)
      return { success: true, ...taxonomies }
   }


   // @Get('demo-category')
   // async demoCategory() {
   //    const taxonomies = await this.taxonomyService.demoCategory();
   //    return { success: true, taxonomies };
   // }
}
