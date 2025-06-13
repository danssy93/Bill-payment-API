import { Module } from '@nestjs/common';
import { WalletController } from './controllers/wallets/wallets.controller';
import { WalletService } from './services/wallets/wallets.service';
import { DatabaseModule } from 'src/database/database.module';
import { LedgersModule } from '../ledgers/ledgers.module';
import { WalletRepository } from 'src/database/repositories';

@Module({
  imports: [DatabaseModule.forFeature(), LedgersModule],
  controllers: [WalletController],
  providers: [WalletService, WalletRepository],
  exports: [WalletService],
})
export class WalletsModule {}
