import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RefundFailedTransactionService } from './refund-failed-transactions/refund.service';
import { RequeryTransactionService } from './requery-transactions /requery.service';

@Injectable()
export class CronJobService {
  constructor(
    private readonly failedService: RefundFailedTransactionService,
    private readonly requeryService: RequeryTransactionService,
  ) {}

  private readonly logger = new Logger(CronJobService.name);

  /**
   * Scheduled job that runs at midnight to calculate daily interest
   */
  @Cron('*/2 * * * *') // Runs every 20 minutes
  async handleFailedTransaction(): Promise<void> {
    try {
      this.logger.log('Refunding failed transaction calculation job');

      const result = await this.failedService.processFailedTransactions();

      this.logger.log(result);
    } catch (error) {
      this.logger.error(
        `Error in daily interest calculation: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Scheduled job that runs at midnight to calculate daily interest
   */
  // @Cron(CronExpression.EVERY_10_SECONDS)
  @Cron('*/2 * * * *') // Runs every 20 minutes
  async handleRequeryTransaction(): Promise<void> {
    try {
      this.logger.log('Starting daily interest calculation job');

      const result = await this.requeryService.processRequeryTransactions();

      this.logger.log(result);
    } catch (error) {
      this.logger.error(
        `Error in daily interest calculation: ${error.message}`,
        error.stack,
      );
    }
  }
}
