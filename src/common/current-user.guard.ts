import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtDecodedToken } from './token.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IJwtDecodedToken => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
