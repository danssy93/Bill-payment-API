import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './controllers';
import { AuthService } from './services';
import { UserModule } from '../user';
import { DeviceModule } from '../device/device.module';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { DeviceDetectionService } from '../device/service/new-device-detection.service';
import { CustomerRefreshTokenStrategy } from './strategies';
import { CustomerProfileModule } from '../customer-profile/customer-profile.module';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [OtpModule, UserModule, DeviceModule, CustomerProfileModule],
  providers: [
    AuthService,
    CustomerJwtStrategy,
    CustomerRefreshTokenStrategy,
    DeviceDetectionService,
    JwtService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
