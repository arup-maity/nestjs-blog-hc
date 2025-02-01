import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { categoriesList } from 'src/demo-data/categories';
import { categoryImages } from 'src/demo-data/category-images';
import { tagList } from 'src/demo-data/tag';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class TaxonomyService {
   constructor(
      private prisma: PrismaService,
      private fileService: FileService
   ) { }

   async taxonomyById(id: string) {
      try {
         const findTaxonomy = this.prisma.taxonomy.findUnique({
            where: { id: +id },
         })
         if (!findTaxonomy) {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Taxonomy not found' }, HttpStatus.CONFLICT)
         }
         return findTaxonomy;
      } catch (error) {
         throw error
      }
   }
   async taxonomyBySlug(slug: string) {
      try {
         const findTaxonomy = this.prisma.taxonomy.findUnique({
            where: { slug: slug },
         })
         if (!findTaxonomy) {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Taxonomy not found' }, HttpStatus.CONFLICT)
         }
         return findTaxonomy;
      } catch (error) {
         throw error
      }
   }
   async createTaxonomy(data: any) {
      try {
         const checkSlug = await this.prisma.taxonomy.findUnique({
            where: {
               slug: data.slug,
            }
         })
         if (checkSlug) {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Slug already exists' }, HttpStatus.CONFLICT)
         }
         const newtaxonomy = this.prisma.taxonomy.create({ data: data });
         if (!newtaxonomy) {
            throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal server error' }, HttpStatus.INTERNAL_SERVER_ERROR)
         }
         return newtaxonomy
      } catch (error) {
         throw error
      }
   }
   async updateTaxonomy(id: string, data: { [key: string]: string }) {
      try {
         const checkSlug = await this.prisma.taxonomy.findUnique({
            where: {
               slug: data.slug,
               NOT: { id: +id }
            }
         })
         if (checkSlug) {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Slug already exists' }, HttpStatus.CONFLICT)
         }
         const findTaxonomy = await this.prisma.taxonomy.findUnique({
            where: { id: +id },
         })
         if (!findTaxonomy) {
            throw new HttpException({ status: HttpStatus.NOT_FOUND, success: false, message: 'Taxonomy not found' }, HttpStatus.NOT_FOUND)
         }
         const updateTaxonomy = await this.prisma.taxonomy.update({
            where: { id: +id },
            data: data,
         })
         if (!updateTaxonomy) {
            throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal server error' }, HttpStatus.INTERNAL_SERVER_ERROR)
         }
         if (findTaxonomy?.thumbnail !== data?.thumbnail) {
            await this.fileService.deleteFile(findTaxonomy?.thumbnail)
         }
         return updateTaxonomy
      } catch (error) {
         throw error
      }
   }
   async deleteTaxonomy(id: string) {
      const findTaxonomy = await this.prisma.taxonomy.findUnique({
         where: { id: +id },
      })
      if (!findTaxonomy) {
         throw new HttpException({ status: HttpStatus.NOT_FOUND, success: false, message: 'Taxonomy not found' }, HttpStatus.NOT_FOUND)
      }
      const deleteTaxonomy = await this.prisma.taxonomy.delete({ where: { id: +id } })
      if (!deleteTaxonomy) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal server error' }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
      await this.fileService.deleteFile(findTaxonomy?.thumbnail)
      return true
   }
   async taxonomies(queryParameter: { [key: string]: any }) {
      try {
         const { page = 1, limit = 25, search = '', sortColumn = 'createdAt', sortOrder = 'desc', post_type = "", type = "category", include = [], exclude = [] } = queryParameter
         const conditions: any = {}
         if (search) {
            conditions.OR = [
               { name: { contains: search, mode: "insensitive" } },
               { slug: { contains: search, mode: "insensitive" } },
            ]
         }
         if (post_type) {
            conditions.post_type = post_type
         }
         conditions.type = type

         if (include.length > 0) {
            conditions.id = { in: include };
         }

         if (exclude.length > 0) {
            conditions.id = { notIn: exclude };
         }

         const query: any = {}
         if (sortColumn && sortOrder) {
            query.orderBy = { [sortColumn]: sortOrder }
         }
         const taxonomies = await this.prisma.taxonomy.findMany({
            where: conditions,
            take: +limit,
            skip: (+page - 1) * +limit,
            ...query,
         });

         const count = await this.prisma.taxonomy.count({
            where: conditions,
         });

         return { taxonomies, count };
      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal server error', error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }
   async taxonomiesForPost(queryParameter: { [key: string]: string }) {
      try {
         const { search = '', post_type = "all", type = "category" } = queryParameter
         const conditions: any = {}
         if (search) {
            conditions.OR = [
               { name: { contains: search, mode: "insensitive" } },
               { slug: { contains: search, mode: "insensitive" } },
            ]
         }
         if (post_type !== 'all') {
            conditions.post_type = post_type
         }
         conditions.type = type

         const taxonomies = await this.prisma.taxonomy.findMany({
            where: conditions,
            orderBy: {
               createdAt: "desc",
            },
            select: {
               id: true,
               name: true,
               slug: true,
               post_type: true,
               type: true
            }
         });
         return taxonomies
      } catch (error) {
         throw error
      }
   }
   // ##################################################### old


   // async demoCategory() {
   //    try {
   //       for (const category of tagList) {

   //          await this.prisma.taxonomy.create({
   //             data: {
   //                name: category.name,
   //                slug: category.slug,
   //                description: category.description,
   //                post_type: category.post_type,
   //                type: 'tag'
   //             }
   //          });
   //       }
   //       // for (const category of categoriesList) {

   //       //    await this.prisma.taxonomy.create({
   //       //       data: {
   //       //          name: category.name,
   //       //          slug: category.slug,
   //       //          description: category.description,
   //       //          thumbnail: `taxonomy/${categoryImages?.[category.id].file_name}`,
   //       //          post_type: category.post_type,
   //       //          type: category.type
   //       //       }
   //       //    });
   //       // }
   //    } catch (error) {
   //       console.log(error)
   //    }
   // }

}
