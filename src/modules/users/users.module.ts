import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './services/users/users.service';
import { UsersController } from './controllers/users/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/User';
import { Wallet } from '../database/entities/Wallet';
import { PowerTransaction } from '../database/entities/PowerTransaction';
import { Ledger } from '../database/entities/Ledger';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Wallet, PowerTransaction, Ledger]),
    forwardRef(() => WalletsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
