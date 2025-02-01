
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from './constants';

@Injectable()
export class UserAuthGuard implements CanActivate {
   constructor(private jwtService: JwtService) { }

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      let token = ''
      token = this.extractTokenFromCookies(request)
      if (!token) {
         token = this.extractTokenFromHeader(request);
      }
      if (!token) {
         throw new UnauthorizedException();
      }
      try {
         const payload = await this.jwtService.verifyAsync(
            token,
            {
               secret: jwtConstants.secret
            }
         );
         request['user'] = payload;
      } catch {
         throw new HttpException({ status: HttpStatus.UNAUTHORIZED, success: false, message: 'Invalid Token' }, HttpStatus.UNAUTHORIZED)
      }
      return true;
   }

   private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
   }

   private extractTokenFromCookies(request: Request): string | undefined {
      const token = request.cookies['token'] || '';
      return token
   }
}
