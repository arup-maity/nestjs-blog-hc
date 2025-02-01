import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class FileService {

   private readonly s3 = new S3Client({
      credentials: {
         accessKeyId: process.env.S3_ACCESS_KEY,
         secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      region: process.env.S3_REGION,
      endpoint: process.env.S3_END_POINT,
   });

   private readonly bucket = "her-conversation"

   constructor() { }

   async uploadFile(file: Express.Multer.File) {
      try {
         const key = file.originalname
         const params = {
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
         };

         await this.s3.send(new PutObjectCommand(params));
         return key
      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error', error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }
   async becomeAuthorFile(file: Express.Multer.File) {
      try {
         const key = `become-author/${file.originalname}`
         const params = {
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read",
         };

         await this.s3.send(new PutObjectCommand(params));
         return key
      } catch (error) {
         console.log(error)
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error', error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }

   async deleteFile(key: string) {
      try {
         const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
         });
         await this.s3.send(command);
         return true
      } catch (error) {
         throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, seccess: false, error }, HttpStatus.INTERNAL_SERVER_ERROR)
      }
   }
}
