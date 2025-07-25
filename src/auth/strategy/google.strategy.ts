import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
   constructor() {
      super({
         clientID: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_SECRET_ID,
         callbackURL: process.env.ENVIRONMENT === 'production' ? 'https://herconversationapi.server.arupmaity.in/api/auth/google-callback' : 'http://localhost:8050/api/auth/google-callback',
         scope: ['email', 'profile'],
      });
   }
   async validate(
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: VerifyCallback,
   ): Promise<any> {
      const { name, emails, photos } = profile;
      const user = {
         email: emails[0].value,
         firstName: name.givenName,
         lastName: name.familyName,
         picture: photos[0].value,
         accessToken,
         refreshToken,
      };
      done(null, user);
   }
}