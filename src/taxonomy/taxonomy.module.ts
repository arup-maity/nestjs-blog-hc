import { Module } from '@nestjs/common';
import { TaxonomyController } from './admin.taxonomy.controller';
import { TaxonomyService } from './taxonomy.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PublicTaxonomyController } from './taxonomy.controller';
import { FileService } from 'src/file/file.service';

@Module({
   controllers: [TaxonomyController, PublicTaxonomyController],
   providers: [TaxonomyService, PrismaService, FileService]
})
export class TaxonomyModule { }
