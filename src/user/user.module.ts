import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostService } from 'src/post/post.service';
import { AdminUserController } from './admin.user.controller';

@Module({
   controllers: [UserController, AdminUserController],
   providers: [UserService, PrismaService, PostService],
})
export class UserModule { }
