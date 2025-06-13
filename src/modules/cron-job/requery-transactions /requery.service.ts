import { Injectable, Logger } from '@nestjs/common';
import { Helpers } from 'src/common/utility.helpers';
import { PowerTransaction } from 'src/database/entities';
import { PowerTransactionRepository } from 'src/database/repositories';
import { TransactionStatus } from 'src/modules/wallets/enums/wallet.enum';
import { LessThanOrEqual } from 'typeorm';

@Injectable()
export class RequeryTransactionService {
  private readonly logger = new Logger(RequeryTransactionService.name);
  private readonly BATCH_SIZE = 100;

  constructor(
    private readonly transactionsRepository: PowerTransactionRepository,
  ) {}

  async processRequeryTransactions(): Promise<void> {
    this.logger.log('Starting IN-PROGRESS transactions requery process');

    try {
      while (true) {
        const failedTransactions = await this.transactionsRepository.findMany({
          where: {
            status: TransactionStatus.IN_PROGRESS,
            is_resolved: false,
            requery_count: LessThanOrEqual(5),
          },
          take: this.BATCH_SIZE,
        });

        if (failedTransactions.length === 0) {
          this.logger.log('No more failed transactions to process');
          break;
        }

        this.logger.log(`Processing ${failedTransactions.length} transactions`);

        for (const transaction of failedTransactions) {
          try {
            const result = {
              status: TransactionStatus.SUCCESSFUL,
            };

            if (result.status === TransactionStatus.IN_PROGRESS) {
              await this.transactionsRepository.update(
                { id: transaction.id },
                {
                  requery_count: transaction.requery_count + 1,
                },
              );
              continue;
            }

            await this.markTransactionResolved(transaction, result);

            this.logger.debug(
              `Successfully reprocessed transaction ID ${transaction.id} (Ref: ${transaction.transaction_id})`,
            );
          } catch (error) {
            this.logger.error(
              `Error processing requery for transaction ID ${transaction.id}: ${error.message}`,
              error.stack,
            );
          }
        }
      }

      this.logger.log('Completed requerying all failed transactions');
    } catch (error) {
      this.logger.error(
        `Error in requery process: ${error.message}`,
        error.stack,
      );
    }
  }

  private async markTransactionResolved(
    transaction: PowerTransaction,
    result,
  ): Promise<void> {
    await this.transactionsRepository.update(
      { id: transaction.id },
      {
        status: result.status,
        is_resolved: true,
        updated_at: new Date(Helpers.getWATDateTimestamp()),
      },
    );
  }
}
