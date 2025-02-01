import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './guard/constants';
import { MailService } from 'src/mail/mail.service';
import { AdminAuthController } from './admin.auth.controller';

@Module({
   imports: [
      JwtModule.register({
         global: true,
         secret: jwtConstants.secret,
         signOptions: { expiresIn: '2d' },
      })
   ],
   controllers: [AuthController, AdminAuthController],
   providers: [AuthService, PrismaService, MailService],
})
export class AuthModule { }
