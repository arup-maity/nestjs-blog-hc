import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('api/admin/post')
export class AdminPostController {
   constructor(private readonly postService: PostService) { }

   @UseGuards(AuthGuard)
   @Get('read-post/:id')
   async readPost(@Param('id') id: string) {
      try {
         const post = await this.postService.readPostForAdmin(id);
         return { success: true, post, message: 'Post list successfully' }
      } catch (error) {
         throw error
      }
   }
   @UseGuards(AuthGuard)
   @Put('change-status/:id')
   async changeStatusPost(@Param("id") id: string, @Body() body: { status: string, rejectedReasons: string }) {
      try {
         const { status, rejectedReasons } = body
         const post = await this.postService.changeStatusPost(id, status)
         if (status === 'rejected' && rejectedReasons) {
            // Send email to user
         }
         return { success: true, post, message: 'Post list successfully' }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(AuthGuard)
   @Get('post-list')
   async postsList(@Query() queryParameter) {
      try {
         const posts = await this.postService.adminPosts(queryParameter)
         return { success: true, ...posts, message: 'Post list successfully' }
      } catch (error) {
         throw error
      }
   }
}
