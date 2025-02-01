import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRegisterDto } from './dto/auth.validation';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
   constructor(
      private prisma: PrismaService,
      private jwtService: JwtService,
      private configService: ConfigService,
      private mailService: MailService
   ) { }

   async userRegister(data: UserRegisterDto): Promise<any> {
      const user = await this.prisma.users.findUnique({
         where: { email: data?.email },
         select: {
            id: true,
            email: true,
            is_active: true
         }
      });
      if (user && user.is_active) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Email already registered' }, HttpStatus.CONFLICT)
      }
      if (user && !user.is_active) {
         const hashPassword = bcrypt.hashSync(data.password, 16)

         const updateUser = await this.prisma.users.update({
            where: { email: data?.email },
            data: { userPassword: { update: { password: hashPassword } } }
         })
         if (!updateUser) {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'User Not Registered' }, HttpStatus.CONFLICT)
         }
         const payload = {
            id: updateUser.id,
            accessPurpose: this.configService.get<string>('token_purpose.email_verification')
         };
         const token = await this.jwtService.signAsync(payload)
         const options = {
            from: {
               email: this.configService.get<string>('send_email_verification_mail.form_email'),
               name: this.configService.get<string>('send_email_verification_mail.form_name')
            },
            to: {
               email: data.email,
               name: data.name
            },
            subject: 'Email Verification',
            text: `To verify your email, please click on the following link: ${this.configService.get<string>('app_url')}/auth/verify-email/${token}`
         }
         this.mailService.sendMail(options)
         return { token }
      } else {
         const hashPassword = bcrypt.hashSync(data.password, 16)
         // Extract text before '@'
         const textBeforeAt = data.email.split('@')[0];
         const sanitizedText = textBeforeAt.replace(/[^a-zA-Z0-9]/g, '');
         const randomDigits = Math.floor(100 + Math.random() * 900);
         const username = sanitizedText + randomDigits;

         const newUser = await this.prisma.users.create({
            data: {
               name: data.name,
               email: data.email,
               username: username,
               role: 'user',
               userPassword: {
                  create: {
                     method: "password",
                     password: hashPassword
                  }
               }
            }
         })

         if (!newUser) {
            throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'User Not Registered' }, HttpStatus.CONFLICT)
         }

         const payload = {
            id: newUser.id,
            accessPurpose: this.configService.get<string>('token_purpose.email_verification')
         };
         const token = await this.jwtService.signAsync(payload)
         const options = {
            from: {
               email: this.configService.get<string>('send_email_verification_mail.form_email'),
               name: this.configService.get<string>('send_email_verification_mail.form_name')
            },
            to: {
               email: data.email,
               name: data.name
            },
            subject: 'Email Verification',
            text: `To verify your email, please click on the following link: ${this.configService.get<string>('app_url')}/auth/verify-email/${token}`
         }
         this.mailService.sendMail(options)
         return { token }
      }
   }

   async userLogin(email: string, password: string): Promise<any> {
      const user = await this.prisma.users.findUnique({
         where: { email },
         select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            email_verified: true,
            is_author: true,
            userPassword: {
               select: {
                  password: true,
               },
            }
         }
      });
      if (!user) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'User Not Found' }, HttpStatus.CONFLICT)
      }
      const isMatch = await bcrypt.compare(password, user.userPassword.password);
      if (!isMatch) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'User and Password Not Matched' }, HttpStatus.CONFLICT)
      }
      if (user && !user?.email_verified) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Email not verified' }, HttpStatus.CONFLICT)
      }
      const payload = {
         id: user.id,
         name: user.name,
         image: user.avatar,
         emailVerified: user.email_verified || false,
         is_author: user.is_author || false,
         role: user.role,
         accessPurpose: 'user'
      };
      const access_token = await this.jwtService.signAsync(payload)
      return {
         payload,
         access_token
      };
   }

   async userGoogleLogin(details: { [key: string]: any }) {
      const user = await this.prisma.users.findUnique({
         where: { email: details.email },
         select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            email_verified: true,
            is_author: true,
         }
      });
      if (!user) {
         // Extract text before '@'
         const textBeforeAt = details.email.split('@')[0];
         const sanitizedText = textBeforeAt.replace(/[^a-zA-Z0-9]/g, '');
         const randomDigits = Math.floor(100 + Math.random() * 900);
         const username = sanitizedText + randomDigits;
         const newUser = await this.prisma.users.create({
            data: {
               name: details.firstName + ' ' + details.lastName,
               username,
               email: details.email,
               avatar: details.picture,
               is_active: true,
               email_verified: true,
               role: 'user',
            }
         })
         const payload = {
            id: newUser.id,
            name: newUser.name,
            image: newUser.avatar,
            emailVerified: newUser.email_verified || false,
            is_author: newUser.is_author || false,
            role: newUser.role,
            accessPurpose: 'user'
         };
         const access_token = await this.jwtService.signAsync(payload)
         return {
            payload,
            access_token
         };
      }
      const payload = {
         id: user.id,
         name: user.name,
         image: user.avatar,
         emailVerified: user.email_verified || false,
         is_author: user.is_author || false,
         role: user.role,
         accessPurpose: 'user'
      };
      const access_token = await this.jwtService.signAsync(payload)
      return {
         payload,
         access_token
      };
   }

   // ####### Admin
   async adminLogin(email: string, password: string): Promise<any> {
      const user = await this.prisma.users.findUnique({
         where: { email },
         include: {
            userPassword: {
               select: {
                  password: true,
               },
            }
         }
      });
      if (!user) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'User not found' }, HttpStatus.CONFLICT)
      }
      const isMatch = await bcrypt.compare(password, user.userPassword.password);
      if (!isMatch) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'User and Password Not Matched' }, HttpStatus.CONFLICT)
      }
      const payload = {
         id: user.id,
         email: user.email,
         avatar: user.avatar,
         role: user.role,
         accessPurpose: 'admin'
      };
      const token = await this.jwtService.signAsync(payload)
      return token

   }

   // #################################### old





   async userChangePassword(id: string, current_password: string, new_password: string) {
      const user = await this.prisma.users.findUnique({
         where: { id: +id },
         include: {
            userPassword: {
               select: {
                  password: true,
               },
            },
         }
      });

      const isMatch = await bcrypt.compare(current_password, user.userPassword.password);
      if (!isMatch) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Current Password Not Matched' }, HttpStatus.CONFLICT)
      }
      const hashPassword = bcrypt.hashSync(new_password, 16)
      const update_password = await this.prisma.users.update({
         where: { id: +id },
         data: { userPassword: { update: { password: hashPassword } } }
      })
      if (!update_password) {
         throw new HttpException({ status: HttpStatus.CONFLICT, success: false, message: 'Password Not Changed' }, HttpStatus.CONFLICT)
      }
      return { message: 'Password Changed Successfully' }
   }
}
