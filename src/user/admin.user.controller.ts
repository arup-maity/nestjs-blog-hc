import { Controller, Get, UseGuards, Response, Body, Query, Param, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { FilterQueryDto, UpdateBecomeAuthorDto, UpdateUserDto, } from './dto/user.validation';



@Controller('api/admin/users')
export class AdminUserController {
   constructor(
      private readonly userService: UserService,
   ) { }


   @UseGuards(AuthGuard)
   @Get('read-user/:id')
   async getUserById(@Param('id') id: string, @Response() res) {
      const user = await this.userService.getUserById(id);
      return res.status(200).json({ success: true, user });
   }

   @UseGuards(AuthGuard)
   @Put('update-user/:id')
   async updateUser(@Param('id') id: string, @Body() updateUser: UpdateUserDto, @Response() res) {
      const userUpdate = await this.userService.updateUser(id, updateUser)
      return res.status(200).json({ success: true, user: userUpdate, message: "Updated user successfully" });
   }

   @UseGuards(AuthGuard)
   @Get('users-list')
   async userList(@Query() query: FilterQueryDto, @Response() res) {
      const users = await this.userService.filterUserList(query);
      return res.status(200).json({ success: true, users });
   }

   // ############################# Become Author #############################

   @UseGuards(AuthGuard)
   @Get('become-author/:id')
   async readBecomeAuthor(@Param('id') id: string, @Response() res) {
      try {
         const author = await this.userService.readBecomeAuthor(id);
         return res.status(200).json({ success: true, author });
      } catch (error) {
         throw error
      }
   }

   @UseGuards(AuthGuard)
   @Put('update-become-author/:id')
   async updateBecomeAuthor(@Param('id') id: string, @Body() body: UpdateBecomeAuthorDto, @Response() res) {
      try {
         console.log(body)
         const author = await this.userService.updateBecomeAuthor(id, body?.status);
         if (body?.status === 'rejected' && body?.reason) {
            // Send email to user
            // Update status in database
         }
         return res.status(200).json({ success: true, author });
      } catch (error) {
         throw error
      }
   }

   @UseGuards(AuthGuard)
   @Get('become-author-list')
   async becomeAuthorList(@Query() query: FilterQueryDto, @Response() res) {
      const list = await this.userService.becomeAuthorList(query);
      return res.status(200).json({ success: true, list });
   }
}
