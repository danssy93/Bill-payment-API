import { Module } from '@nestjs/common';
import { PowerTransactionService } from './services/power_transactions/power_transactions.service';
import { PowerTransactionController } from './controllers/power_transactions/power_transactions.controller';
import { PowerTransactionRepository } from 'src/database/repositories';
import { DatabaseModule } from 'src/database/database.module';
import { WalletsModule } from '../wallets/wallets.module';
import { PowerTransactionManagementService } from './services/power_transactions/power-transaction-management.service';

@Module({
  imports: [DatabaseModule.forFeature(), WalletsModule],
  providers: [
    PowerTransactionService,
    PowerTransactionRepository,
    PowerTransactionManagementService,
  ],
  exports: [PowerTransactionService],
  controllers: [PowerTransactionController],
})
export class PowerTransactionsModule {}
