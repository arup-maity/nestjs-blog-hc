import { Controller, Get, Post, Body, Response, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/auth.validation';
import { AuthGuard } from './guard/auth.guard';

@Controller('api/admin/auth')
export class AdminAuthController {
   constructor(
      private readonly authService: AuthService
   ) { }

   @Post('login')
   async login(
      @Body() credentials: AdminLoginDto,
      @Response() res,
   ) {
      const token = await this.authService.adminLogin(credentials.email, credentials?.password);
      res.cookie('token', token, {
         expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
         sameSite: 'strict',
         httpOnly: true,
         secure: true,
      });
      return res.status(200).json({ success: true, token, message: 'Login successful' });
   }

   @UseGuards(AuthGuard)
   @Get('check-token')
   async checkToken(@Request() req, @Response() res) {
      const user = req.user
      if (user) {
         return res.status(200).json({ success: true, login: true, user });
      } else {
         return res.status(401).json({ success: false, login: false, message: 'Unauthorized' });
      }
   }
}
