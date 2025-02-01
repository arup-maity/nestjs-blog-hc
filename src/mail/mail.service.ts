import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer'
@Injectable()
export class MailService {

   private readonly mailTransporter = nodemailer.createTransport({
      host: process.env.MAIL_SMTP,
      port: 587,
      secure: false,
      auth: {
         user: process.env.MAIL_USERNAME,
         pass: process.env.MAIL_PASSWORD,
      }
   })

   constructor(
      private configService: ConfigService,
   ) { }

   async sendMail(options: any) {
      try {
         this.mailTransporter.verify(function (error, success) {
            if (error) {
               console.log('error =>', error);
            } else {
               console.log("Server is ready to take our messages");
            }
         });
         // const sendMail = await this.mailTransporter.sendMail({
         //    from: {
         //       name: 'Her Conversation',
         //       address: '801d41001@smtp-brevo.com', // sender address
         //    },
         //    to: {
         //       name: "Arup",
         //       address: 'arupmaity550@gmail.com', // receiver address
         //    },
         //    subject: "Hello ✔", // Subject line
         //    text: "Hello {{ contact.FIRSTNAME }} , This is an SMTP message with customizations", // plain text body

         // }, (err, data) => {
         //    if (err) {
         //       console.log(err)
         //    }
         // })
         return '';
      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, success: false, message: 'Internal server error', error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }


}
