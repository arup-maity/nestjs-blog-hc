import { Controller, Get, Post, Body, Response, UseGuards, Request, Put, HttpException, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto, UserRegisterDto } from './dto/auth.validation';
import { AuthGuard } from './guard/auth.guard';
import { UserAuthGuard } from './guard/user.auth.guard';
import { MailService } from 'src/mail/mail.service';
import { GoogleOAuthGuard } from './strategy/google-oauth.guard';

@Controller('api/auth')
export class AuthController {
   constructor(
      private readonly authService: AuthService,
      private mailService: MailService
   ) { }

   @Post('user-register')
   async userRegister(
      @Body() credentials: UserRegisterDto,
      @Response() res,
   ) {
      const result = await this.authService.userRegister(credentials);
      return res.status(200).json({ success: true, token: result.access_token, message: 'Login successful' });
   }

   @Post('user-login')
   async userLogin(
      @Body() credentials: AdminLoginDto,
      @Response() res,
   ) {
      const result = await this.authService.userLogin(credentials.email, credentials?.password);
      res.cookie('token', result?.access_token, {
         expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
         sameSite: 'strict',
         httpOnly: false,
         secure: true,
         domnain: process.env.ENVIRONMENT !== 'production' ? 'localhost' : '.arupmaity.in'
      });
      return res.status(200).json({ success: true, user: result.payload, message: 'Login successful' });
   }

   @UseGuards(GoogleOAuthGuard)
   @Get('google-login')
   async googleLogin(@Response() res) {
      res.status(200).json({ success: true, message: 'Google login successful' });
   }

   @UseGuards(GoogleOAuthGuard)
   @Get('google-callback')
   async googleAuthRedirect(@Request() req, @Res() res) {
      try {
         const response = await this.authService.userGoogleLogin(req.user)
         res.cookie('token', response?.access_token, {
            expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
            sameSite: 'strict',
            httpOnly: false,
            secure: true,
            domnain: process.env.ENVIRONMENT !== 'production' ? 'localhost' : '.arupmaity.in'
         });
         return res.status(302).redirect('https://her-conversation.arupmaity.in');
      } catch (error) {
         return res.status(302).redirect('https://her-conversation.arupmaity.in/?user=not-found');
      }
   }

   @UseGuards(UserAuthGuard)
   @Get('user-token-check')
   async userTokenCheck(@Request() req, @Response() res) {
      const user = req.user
      if (user) {
         return res.status(200).json({ success: true, login: true, user });
      } else {
         return res.status(401).json({ success: false, login: false, message: 'Unauthorized' });
      }
   }

   // ###################################### old

   @Post('admin-login')
   async login(
      @Body() credentials: AdminLoginDto,
      @Response() res,
   ) {
      const result = await this.authService.adminLogin(credentials.email, credentials?.password);
      res.cookie('token', result?.access_token, {
         expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
         sameSite: 'strict',
         httpOnly: true,
         secure: true,
      });
      return res.status(200).json({ success: true, token: result.access_token, message: 'Login successful' });
   }

   @UseGuards(AuthGuard)
   @Get('admin-check-token')
   async checkToken(@Request() req, @Response() res) {
      const user = req.user
      if (user) {
         return res.status(200).json({ success: true, login: true, user });
      } else {
         return res.status(401).json({ success: false, login: false, message: 'Unauthorized' });
      }
   }





   @UseGuards(UserAuthGuard)
   @Put('update-password')
   async updatePassword(@Request() req, @Body() body: { current_password: string, new_password: string }, @Response() res) {
      try {
         if (body.current_password === body.new_password) {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'New Password Should Not Be Same As Current Password' }, HttpStatus.CONFLICT)
         }

         await this.authService.userChangePassword(req.user.id, body.current_password, body.new_password)
         return res.status(200).json({ success: true, message: 'Password chnage succesfully' });
      } catch (error) {
         throw error
      }
   }
}
