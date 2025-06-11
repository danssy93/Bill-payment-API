import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONFIGURATION } from 'src/libs';
import AppError from 'src/shared/errors/AppError';
import { IJwtDecodedToken } from 'src/shared/interfaces';
import { AuthService } from '../services';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  'customer-jwt',
) {
  private readonly logger = new Logger(CustomerJwtStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: CONFIGURATION.JWT.CUSTOMER.ACCESS_TOKEN.SECRET,
    });
  }

  async validate(payload: IJwtDecodedToken) {
    const user = await this.authService.validateUser(payload.sub);

    if (!user || (user && (!user.refresh_token || !user.status))) {
      throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
