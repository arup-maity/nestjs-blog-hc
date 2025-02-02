import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// import * as csurf from 'csurf';
async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   app.use(cookieParser());
   // app.use(csurf({ cookie: true }));

   app.enableCors({
      origin: [
         'http://localhost:5173',
         'http://localhost:3000',
         'http://localhost:3001',
         'https://her-conversation.arupmaity.in',
         'https://admin-conversation.arupmaity.in'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
   });

   app.useGlobalPipes(
      new ValidationPipe({
         transform: true, // Automatically transform query params to DTO types
         whitelist: true, // Strip unknown properties
         forbidNonWhitelisted: true, // Throw an error if unknown properties are provided
      }),
   );

   const config = new DocumentBuilder()
      .setTitle('Her Conversation Api Documentation')
      .setDescription('The Her Conversation API description')
      .setVersion('1.0')
      .build();
   const documentFactory = () => SwaggerModule.createDocument(app, config);
   SwaggerModule.setup('api-doc', app, documentFactory);


   await app.listen(process.env.PORT ?? 8050);
}
bootstrap();
