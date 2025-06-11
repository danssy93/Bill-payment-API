import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import AppError from 'src/shared/errors/AppError';

@Injectable()
export class CustomerJwtGuard extends AuthGuard('customer-jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user || !user.refresh_token) {
      throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
