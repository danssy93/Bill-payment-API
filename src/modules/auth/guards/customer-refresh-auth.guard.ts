import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import AppError from 'src/shared/errors/AppError';

@Injectable()
export class CustomerRefreshAuthGuard extends AuthGuard(
  'customer-jwt-refresh',
) {
  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
