import { Injectable, Logger } from '@nestjs/common';
import { Helpers } from 'src/common/utility.helpers';
import { PowerTransaction } from 'src/database/entities';
import { PowerTransactionRepository } from 'src/database/repositories';
import {
  TransactionStatus,
  TransactionType,
} from 'src/modules/wallets/enums/wallet.enum';
import { WalletService } from 'src/modules/wallets/services/wallets/wallets.service';

@Injectable()
export class RefundFailedTransactionService {
  private readonly logger = new Logger(RefundFailedTransactionService.name);
  private readonly BATCH_SIZE = 20;

  constructor(
    private readonly walletService: WalletService,
    private readonly transactionsRepository: PowerTransactionRepository,
  ) {}

  async processFailedTransactions() {
    this.logger.log('Starting failed transactions refund process');

    let batch = 0;
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;

    while (true) {
      const failedTransactions = await this.transactionsRepository.findMany({
        where: {
          status: TransactionStatus.FAILED,
          is_resolved: false,
        },
        take: this.BATCH_SIZE,
        skip: batch * this.BATCH_SIZE,
      });

      if (failedTransactions.length === 0) {
        break;
      }

      this.logger.log(
        `Processing batch #${batch + 1} with ${failedTransactions.length} transactions`,
      );

      for (const transaction of failedTransactions) {
        try {
          const refundExists = await this.transactionsRepository.findOne({
            transaction_id: transaction.transaction_id,
            transaction_type: TransactionType.CREDIT,
          });

          if (refundExists) {
            this.logger.log(
              `Transaction ${transaction.transaction_id} already refunded`,
            );

            await this.markTransactionResolved(transaction);

            continue;
          }

          await this.markTransactionResolved(transaction);

          await this.processRefund(transaction);

          totalSuccess++;
        } catch (error) {
          totalFailed++;
          this.logger.error(
            `Error refunding transaction ${transaction.transaction_id}: ${error.message}`,
            error.stack,
          );
        } finally {
          totalProcessed++;
        }
      }

      batch++;
    }

    this.logger.log(
      `Refund process completed. Total: ${totalProcessed}, Success: ${totalSuccess}, Failed: ${totalFailed}`,
    );
  }

  private async processRefund(transaction: PowerTransaction) {
    await this.walletService.creditWallet(
      { user_id: transaction.user_id },
      {
        user_id: transaction.user_id,
        amount: transaction.amount,
        transaction_type: TransactionType.CREDIT,
        transaction_id: transaction.transaction_id,
      },
    );
  }

  private async markTransactionResolved(transaction: PowerTransaction) {
    await this.transactionsRepository.update(
      { id: transaction.id },
      {
        status: TransactionStatus.REFUNDED,
        is_resolved: true,
        updated_at: new Date(Helpers.getWATDateTimestamp()),
      },
    );
  }
}
