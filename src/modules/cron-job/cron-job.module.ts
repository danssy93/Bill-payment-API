import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CronJobService } from './cron-job.service';
import { RefundFailedTransactionService } from './refund-failed-transactions/refund.service';
import { WalletsModule } from '../wallets/wallets.module';
import { RequeryTransactionService } from './requery-transactions /requery.service';
import { PowerTransactionRepository } from 'src/database/repositories';

@Module({
  imports: [DatabaseModule.forFeature(), WalletsModule],
  providers: [
    CronJobService,
    RefundFailedTransactionService,
    RequeryTransactionService,
    PowerTransactionRepository,
  ],
})
export class CronJobModule {}
