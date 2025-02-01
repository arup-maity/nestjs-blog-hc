import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { FileModule } from './file/file.module';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { MailModule } from './mail/mail.module';
import { GoogleStrategy } from './auth/strategy/google.strategy';

@Module({
   imports: [
      AuthModule,
      UserModule,
      PrismaModule,
      TaxonomyModule,
      FileModule,
      ConfigModule.forRoot({
         load: [configuration],
         isGlobal: true,
      }),
      PostModule,
      MailModule,
   ],
   providers: [GoogleStrategy]
})
export class AppModule { }
