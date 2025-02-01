import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminPostController } from './admin.post.controller';

@Module({
   providers: [PostService, PrismaService],
   controllers: [PostController, AdminPostController]
})
export class PostModule { }
