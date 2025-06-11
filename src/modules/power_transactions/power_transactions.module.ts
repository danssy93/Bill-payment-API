import { Module } from '@nestjs/common';
import { PowerTransactionService } from './services/power_transactions/power_transactions.service';
import { PowerTransactionController } from './controllers/power_transactions/power_transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { LedgersModule } from '../ledgers/ledgers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PowerTransactionsModule]),
    UsersModule,
    LedgersModule,
  ],
  providers: [PowerTransactionService],
  controllers: [PowerTransactionController],
})
export class PowerTransactionsModule {}
