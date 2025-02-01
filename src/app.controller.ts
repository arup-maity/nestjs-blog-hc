import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class AppController {

   constructor() { }

   @Get()
   async healthCheck() {
      return { status: 'OK' };
   }


}