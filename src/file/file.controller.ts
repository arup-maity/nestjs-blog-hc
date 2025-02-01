import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';

@Controller('api/file')
export class FileController {
   constructor(private readonly fileService: FileService) { }

   @Post('/upload-file')
   @UseInterceptors(FileInterceptor('file'))
   async uploadFile(@UploadedFile() file: Express.MulterS3.File) {
      try {
         const upload = this.fileService.uploadFile(file)
         return { success: true, fileUrl: file.originalname, upload }
      } catch (error) {
         console.log(error)
         throw error
      }
   }

   @Post('/upload-author-file')
   @UseInterceptors(FileInterceptor('file'))
   async uploadAuthorFile(@UploadedFile() file: Express.MulterS3.File) {
      try {
         this.fileService.becomeAuthorFile(file)
         return { success: true, fileUrl: `become-author/${file.originalname}` }
      } catch (error) {
         console.log(error)
         throw error
      }
   }
}



















// @UploadedFile(
//    new ParseFilePipe({
//       validators: [
//          new FileTypeValidator({
//             fileType: /(image\/jpeg|image\/png|image\/webp)$/, // accept only these formats for image uploads
//          }),
//          new MaxFileSizeValidator({
//             maxSize: 3 * 1024 * 1024, // 3MB
//             message: 'File is too large. Max file size is 10MB',
//          }),
//       ],
//       fileIsRequired: true,
//    }),
// )