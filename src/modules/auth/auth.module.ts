import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers';
import { AuthService } from './services';
import { UsersModule } from '../users/users.module';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { CONFIGURATION } from 'src/libs';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: CONFIGURATION.JWT.ACCESS_TOKEN.SECRET,
      signOptions: {
        expiresIn: CONFIGURATION.JWT.ACCESS_TOKEN.EXPIRY,
      },
    }),
  ],
  providers: [AuthService, CustomerJwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
