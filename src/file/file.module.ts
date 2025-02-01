import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
   providers: [FileService, ConfigModule],
   controllers: [FileController],
})
export class FileModule { }
