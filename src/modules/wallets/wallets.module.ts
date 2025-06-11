import { forwardRef, Module } from '@nestjs/common';
import { WalletController } from './controllers/wallets/wallets.controller';
import { WalletService } from '../../../wallets/wallets.service';
import { Ledger } from '../../database/entities/Ledger';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Ledger]), forwardRef(() => UsersModule)],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletsModule {}
