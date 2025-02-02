import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('AuthMiddleware: Request received', req.headers); // Log the request headers
    // ... your authentication logic here ...
    console.log('AuthMiddleware: User', req);
    next();
  }
}
