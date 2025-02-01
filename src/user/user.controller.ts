import { Controller, Get, UseGuards, Response, Body, Query, Put, Request, Post, ValidationPipe, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserAuthorDto } from './dto/user.validation';
import { PostService } from 'src/post/post.service';
import { ProfileUpdateDto } from './dto/profile-update';
import { ProfilePostFilterDto } from './dto/post-filter';
import { UserAuthGuard } from 'src/auth/guard/user.auth.guard';


@Controller('api/user')
export class UserController {
   constructor(
      private readonly userService: UserService,
      private readonly postService: PostService
   ) { }

   @UseGuards(UserAuthGuard)
   @Get('profile-details') // done
   async userList(@Request() req, @Response() res) {
      try {
         const user = await this.userService.profileDetails(req.user.id)
         return res.status(200).json({ success: true, user });
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Put('update-profile') // done
   async userUpdateProfile(@Request() req, @Body() body: ProfileUpdateDto, @Response() res) {
      try {
         const user = await this.userService.profileUpdate(req.user.id, body)
         return res.status(200).json({ success: true, user });
      } catch (error) {
         throw error
      }
   }
   @UseGuards(UserAuthGuard)
   @Put('update-profile-avatar') // done
   async userUpdateProfileAvatar(@Request() req, @Body() body, @Response() res) {
      try {
         const { avatarUrl } = body
         const user = await this.userService.profileAvatarUpdate(req.user.id, avatarUrl)
         return res.status(200).json({ success: true, user });
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Get('profile-posts') // done
   async profilePosts(
      @Request() req,
      @Query(new ValidationPipe({ transform: true })) query: ProfilePostFilterDto
   ) {
      try {
         const user = req.user
         const posts = await this.postService.profilePosts(user.id, query);
         return { success: true, ...posts, message: 'Post read successfully' }
      } catch (error) {
         throw error
      }
   }

   @Get('author-profile/:username') //done
   async authorProfile(@Param('username') username: string) {
      try {
         const author = await this.userService.authorProfile(username)
         if (!author) {
            return { success: false, author, message: 'Author profile read successfully' }
         } return { success: true, author, message: 'Author profile read successfully' }

      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Post('author-follow')
   async updateAuthorFollowers(@Request() req, @Response() res, @Body() body) {
      try {
         const user = req.user
         const { author_id, follow } = body
         const update = await this.userService.updateAuthorFollower(user?.id, author_id, follow)
         return res.status(200).json({ success: true, update, message: 'Author follower updated successfully' })
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Get('check-author-follow/:authorid')
   async checkAuthorFollow(@Request() req, @Param('authorid') authorid: string, @Response() res) {
      try {
         const user = req.user
         const follow = await this.userService.checkAuthorFollow(user?.id, authorid)
         return res.status(200).json({ success: true, follow, message: 'Author follower checked successfully' })
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Get('check-post-like/:postid')
   async checkPostLike(@Request() req, @Param('postid') postid: string, @Response() res) {
      try {
         const user = req.user
         const liked = await this.userService.checkPostLike(user?.id, postid)
         return res.status(200).json({ success: true, liked, message: 'Post like checked successfully' })
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Get('check-post-bookmark/:postid')
   async checkPostBookmark(@Request() req, @Param('postid') postid: string, @Response() res) {
      try {
         const user = req.user
         const bookmarked = await this.userService.checkPostBookmark(user?.id, postid)
         return res.status(200).json({ success: true, bookmarked, message: 'Post like checked successfully' })
      } catch (error) {
         throw error
      }
   }

   // ############################# Become Author #############################

   @UseGuards(UserAuthGuard)
   @Post('become-author-application')
   async becomeAuthorApplication(@Body() body: UserAuthorDto, @Request() req, @Response() res) {
      try {
         const user = req.user
         const application = await this.userService.becomeAuthorApplication(user.id, body)
         return res.status(200).json({ success: true, application, message: 'Application submitted successfully' })
      } catch (error) {
         throw error
      }
   }

   @UseGuards(UserAuthGuard)
   @Get('check-author-application')
   async checkAuthorApplication(@Request() req, @Response() res) {
      try {
         const user = req.user
         const author = await this.userService.checkAuthorApplication(user.id)
         if (author) {
            return res.status(200).json({ success: true, application: true, message: 'Application applied' })
         } else {
            return res.status(200).json({ success: true, application: false, message: 'No application applied' })
         }
      } catch (error) {
         throw error
      }
   }

   // @Get('demo-user')
   // async demoUser(@Request() req, @Response() res) {
   //    try {
   //       const user = await this.userService.demoUser()
   //       return res.status(200).json({ success: true, user, message: 'Demo user created successfully' })
   //    } catch (error) {
   //       throw error
   //    }
   // }

}