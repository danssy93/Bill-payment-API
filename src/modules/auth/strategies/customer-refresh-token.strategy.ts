import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import AppError from 'src/shared/errors/AppError';
import { CONFIGURATION } from 'src/libs';
import { AuthService } from '../services';
import { IJwtDecodedToken } from 'src/shared';

@Injectable()
export class CustomerRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'customer-jwt-refresh',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: CONFIGURATION.JWT.CUSTOMER.REFRESH_TOKEN.SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: IJwtDecodedToken) {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    const user = await this.authService.validateUser(payload.sub);

    if (!user || (user && !user.status)) {
      throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const storedRefreshToken = user.refresh_token;

    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      throw new AppError(
        'Session expired, login again',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}
