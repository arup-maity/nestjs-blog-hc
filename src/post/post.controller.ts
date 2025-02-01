import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, } from './post.validation';
import { DraftPostDto } from './dto/draft-post';
import { PublishPostDto } from './dto/publish-post';
import { UserAuthGuard } from 'src/auth/guard/user.auth.guard';
import { UserMiddlewareGuard } from 'src/auth/guard/user.middleware.guard';
import { isEmpty } from 'src/utils';

@Controller('api/post')
export class PostController {
   constructor(private readonly postService: PostService) { }

   @UseGuards(UserAuthGuard)
   @Post('save-draft-post')
   async saveDraftPost(@Body() body: DraftPostDto, @Request() req) {
      try {
         const user = req.user
         if (body?.id) {
            const post = await this.postService.updateDraftPost({ ...body, authorId: user.id });
            return { success: true, post, message: 'Post save as draft successfully' }
         } else {
            const post = await this.postService.createDraftPost({ ...body, authorId: user.id });
            return { success: true, post, message: 'Post save as draft successfully' }
         }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Post('publish-post')
   async publishPost(@Body() body: PublishPostDto, @Request() req) {
      try {
         const user = req.user
         if (body?.id) {
            const post = await this.postService.publishPost({ ...body, authorId: user.id });
            return { success: true, post, message: 'Post published successfully' }
         } else {
            const post = await this.postService.createAndPublishPost({ ...body, authorId: user.id });
            return { success: true, post, message: 'Post published successfully' }
         }
      } catch (error) {
         throw error
      }
   }

   @Get('public-post/:slug')
   async blogPost(@Param("slug") slug: string) {
      try {
         const post = await this.postService.publicPost(slug);
         return { success: true, post, message: 'Post fatch successfully' }
      } catch (error) {
         throw error
      }
   }

   @Get('public-post-metadata/:slug')
   async blogPostMeta(@Param("slug") slug: string) {
      try {
         const post = await this.postService.publicPostMeta(slug);
         return { success: true, post, message: 'Post fatch successfully' }
      } catch (error) {
         throw error
      }
   }

   @Get('public-post-comment/:id')
   async blogPostComment(@Param("id") id: string) {
      try {
         if (id) {
            const comments = await this.postService.publicPostComment(id);
            return { success: true, comments, message: 'Post fatch successfully' }
         } else {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Please send post id' }, HttpStatus.CONFLICT)
         }
      } catch (error) {
         throw error
      }
   }

   @Get("public-post-list")
   async publicPosts(@Query() queryParameter: { [key: string]: string }) {
      try {
         const posts = await this.postService.publicPosts(queryParameter);
         return { success: true, ...posts, message: 'Posts fetched successfully' }
      } catch (error) {
         throw error
      }
   }

   @Get('author-post/:authorId')
   async authorPosts(@Query() queryParameter: { [key: string]: string }, @Param('authorId') authorId: string, @Request() req) {
      try {
         const posts = await this.postService.authorPosts(authorId, queryParameter);
         return { success: true, ...posts, message: 'Posts fetched successfully' }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserMiddlewareGuard)
   @Get('taxonomy-post/:taxonomyId')
   async taxonomyPosts(@Query() queryParameter: { [key: string]: string }, @Param('taxonomyId') taxonomyId: string, @Request() req) {
      try {
         const user = req.user
         const posts = await this.postService.taxonomyPosts(user?.id || null, taxonomyId, queryParameter);
         return { success: true, ...posts, message: 'Posts fetched successfully' }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Post('bookmark-post')
   async bookmarkPost(@Body() body, @Request() req) {
      try {
         const user = req.user
         if (body?.postId) {
            const bookmarked = await this.postService.bookmarkPost(body?.postId, user.id, body?.save);
            return { success: true, bookmarked, message: 'Post bookmark successfully' }
         } else {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Please send post id' }, HttpStatus.CONFLICT)
         }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Post('create-comment')
   async readPostForAdmin(@Body() body, @Request() req) {
      try {
         const user = req.user
         const comment = await this.postService.createPostComment({ ...body, userId: user.id })
         return { success: true, comment, message: 'Post comment created successfully' }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Post('like-post')
   async likePost(@Body() body, @Request() req) {
      try {
         const user = req.user
         const { postId, like } = body
         if (!isEmpty(postId)) {
            const liked = await this.postService.likePost(user.id, postId, like);
            return { success: true, liked, message: 'Post like successfully' }
         } else {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Please send post id' }, HttpStatus.CONFLICT)
         }
      } catch (error) {
         throw error
      }
   }


   @UseGuards(UserMiddlewareGuard)
   @Get('public-recommended-posts')
   async recommendedPosts(@Query() queryParameter: { [key: string]: string }, @Request() req) {
      try {
         const user = req.user
         const posts = await this.postService.recommendedPosts(user?.id || null, queryParameter);
         return { success: true, posts, message: 'Posts fetched successfully' }
      } catch (error) {
         throw error
      }
   }



   // #####################  old ######################

   @UseGuards(UserAuthGuard)
   @Post('create-post')
   async createPost(@Body() body: CreatePostDto, @Request() req) {
      try {
         const user = req.user
         const post = await this.postService.createPost({ ...body, aythorId: user.id });
         return { success: true, post, message: 'Post created successfully' }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Get('read-post/:id')
   async readPost(@Param("id") id: string) {
      try {
         const post = await this.postService.readPost(id);
         return { success: true, post, message: 'Post read successfully' }
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Post('auto-draft-post')
   async autoDraftPost(@Body() body, @Request() req) {
      try {
         const user = req.user
         const post = await this.postService.draftContent({ ...body, authorId: user.id });
         return { success: true, post, message: 'Post created successfully' }
      } catch (error) {
         throw error
      }
   }



   // #########################################################################


   @Get('demo-post')
   async demoPost() {
      try {
         const post = await this.postService.demoPost();
         return { success: true, post, message: 'Post created successfully' }
      } catch (error) {
         throw error
      }
   }




   // #########################################################################
}
