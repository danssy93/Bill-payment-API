import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/services/users/users.service';
import { BaseLoginDto } from '../dto';
import { User } from 'src/database/entities';
import { CONFIGURATION } from 'src/libs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async validateUser(userId: number) {
    const existingUser = await this.userService.findById(userId);

    if (!existingUser) {
      return null;
    }

    return {
      id: existingUser.id,
      phone: existingUser.phone,
      created_at: existingUser?.created_at,
    };
  }

  async login(loginDto: BaseLoginDto) {
    const { phone, password } = loginDto;

    const existingUser = await this.userService.findOne(
      {
        phone,
      },
      true,
    );

    if (!(await existingUser.comparePassword(password))) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const accessTokenDetails = await this.generateAccessToken(existingUser);

    const payload = {
      ...existingUser.toPayload(),
      access_token: accessTokenDetails,
    };

    return {
      status: HttpStatus.OK,
      message: 'Login successful',
      payload,
    };
  }

  async logout(userId: number): Promise<void> {
    await this.userService.update(userId, {});
  }

  async generateAccessToken(payload: Partial<User>) {
    const data = {
      sub: payload.id,
      phone: payload.phone,
    };

    const accessToken = await this.jwtService.signAsync(data, {
      secret: CONFIGURATION.JWT.ACCESS_TOKEN.SECRET,
      expiresIn: CONFIGURATION.JWT.ACCESS_TOKEN.EXPIRY,
    });

    return {
      type: 'Bearer',
      token: accessToken,
      expires_in: CONFIGURATION.JWT.ACCESS_TOKEN.EXPIRY,
    };
  }
}
