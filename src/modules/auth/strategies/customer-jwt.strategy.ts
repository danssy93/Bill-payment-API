import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONFIGURATION } from 'src/libs';
import { AuthService } from '../services';
import { IJwtDecodedToken } from 'src/common/token.interface';

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
      secretOrKey: CONFIGURATION.JWT.ACCESS_TOKEN.SECRET,
    });
  }

  async validate(payload: IJwtDecodedToken) {
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }
}
