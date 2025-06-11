import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Helpers } from 'src/shared';
import { CONFIGURATION } from 'src/libs';
import { UserService } from '../../user';
import { CustomerLoginDto } from '../dto';
import { User } from 'src/database/entities';
import AppError from 'src/shared/errors/AppError';
import { DeviceService } from '../../device/service/device.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly deviceService: DeviceService,
  ) {}

  async validateUser(userId: string) {
    const existingUser = await this.userService.findOne(
      {
        id: userId,
      },
      false,
      {
        relations: ['customer_profile'],
      },
    );

    if (!existingUser) {
      return null;
    }

    return {
      id: existingUser.id,
      phone: existingUser.phone,
      email: existingUser.email,
      tier_level: existingUser?.tier_level,
      created_at: existingUser?.created_at,
      first_name: existingUser?.customer_profile?.first_name,
      last_name: existingUser?.customer_profile?.last_name,
      other_name: existingUser?.customer_profile?.other_name,
      refresh_token: existingUser?.refresh_token,
      status: existingUser?.status,
    };
  }

  async login(loginDto: CustomerLoginDto) {
    const { identifier, password, device } = loginDto;

    const existingUser = await this.userService.findOne(
      [
        {
          email: identifier,
        },
        {
          phone: identifier.replace('+', ''),
        },
      ],
      true,
      {
        relations: ['customer_profile', 'device'],
      },
    );

    if (existingUser && !existingUser.verified) {
      throw new AppError(
        'Your account is pending verification',
        HttpStatus.NOT_FOUND,
      );
    }

    if (existingUser && !existingUser.status) {
      throw new AppError(
        'Your account is currently suspended, contact admin',
        HttpStatus.NOT_FOUND,
      );
    }

    const maxAttempts = CONFIGURATION.CREDENTIALS.PASSWORD_MAX_ATTEMPTS;
    const currentAttempts = existingUser.password_attempts;

    if (!(await existingUser.comparePassword(password))) {
      const newAttempt = currentAttempts + 1;

      if (newAttempt >= maxAttempts) {
        await this.userService.update(
          { id: existingUser.id },
          { password_attempts: newAttempt, status: false },
        );

        throw new AppError(
          'Your account has been suspended due to multiple incorrect Password attempts. Please contact support.',
          HttpStatus.FORBIDDEN,
        );
      }

      await this.userService.update(
        { id: existingUser.id },
        { password_attempts: newAttempt },
      );

      const attemptsLeft = maxAttempts - newAttempt;

      throw new AppError(
        `Invalid credentials, ${attemptsLeft} attempts left, please try again`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingDevice = await this.deviceService.findOne({
      user_id: existingUser.id,
    });

    if (existingDevice && !(await existingDevice.compareDevice(device))) {
      await Promise.all([
        this.userService.update(
          { id: existingUser.id },
          {
            status: false,
          },
        ),

        this.deviceService.update(
          { id: existingDevice.id },
          {
            device,
          },
        ),
      ]);

      return {
        status: HttpStatus.OK,
        message: 'New Device detected',
        payload: {
          status: false,
          is_phone_verified: true,
          is_email_verified: !existingUser.email ? false : true,
          token: await this.generateVerifyDeviceToken(existingUser),
        },
      };
    }

    const accessTokenDetails = await this.generateAccessToken(existingUser);

    const refreshTokenDetails = await this.generateRefreshTokens(existingUser);

    const { first_name, other_name, last_name } = existingUser.customer_profile;
    const payload = {
      first_name,
      last_name,
      other_name,
      ...existingUser.toPayload(),
      access_token: accessTokenDetails,
      refresh_token: refreshTokenDetails,
    };

    await this.userService.update(
      { id: existingUser.id },
      {
        password_attempts: 0,
        last_login: new Date(Helpers.getWATDateTimestamp()),
        refresh_token: refreshTokenDetails.token,
      },
    );

    return {
      status: HttpStatus.OK,
      message: 'Login successful',
      payload,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userService.update(
      { id: userId },
      {
        refresh_token: null,
      },
    );
  }

  async generateVerifyDeviceToken(payload: Partial<User>) {
    const data = {
      sub: payload.id,
      phone: payload.phone,
    };

    const accessToken = await this.jwtService.signAsync(data, {
      secret: CONFIGURATION.JWT.CHANGE_DEVICE.SECRET,
      expiresIn: CONFIGURATION.JWT.CHANGE_DEVICE.EXPIRY,
    });

    return {
      type: 'Bearer',
      token: accessToken,
      expires_in: CONFIGURATION.JWT.CHANGE_DEVICE.EXPIRY,
    };
  }

  async generateAccessToken(payload: Partial<User>, mainWalletId?: string) {
    const data = {
      sub: payload.id,
      email: payload?.email,
      phone: payload.phone,
      wallet_id: mainWalletId,
    };

    const accessToken = await this.jwtService.signAsync(data, {
      secret: CONFIGURATION.JWT.CUSTOMER.ACCESS_TOKEN.SECRET,
      expiresIn: CONFIGURATION.JWT.CUSTOMER.ACCESS_TOKEN.EXPIRY,
    });

    return {
      type: 'Bearer',
      token: accessToken,
      expires_in: CONFIGURATION.JWT.CUSTOMER.ACCESS_TOKEN.EXPIRY,
    };
  }

  private async generateRefreshTokens(payload: Partial<User>) {
    const data = {
      sub: payload.id,
      email: payload.email,
      phone: payload.phone,
    };

    const refreshToken = await this.jwtService.signAsync(data, {
      secret: CONFIGURATION.JWT.CUSTOMER.REFRESH_TOKEN.SECRET,
      expiresIn: CONFIGURATION.JWT.CUSTOMER.REFRESH_TOKEN.EXPIRY,
    });

    return {
      type: 'Bearer',
      token: refreshToken,
      expires_in: CONFIGURATION.JWT.CUSTOMER.REFRESH_TOKEN.EXPIRY,
    };
  }
}
