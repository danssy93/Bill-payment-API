import { DataSource, QueryRunner } from 'typeorm';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { WalletRepository } from 'src/database/repositories/wallet.repository';
import { Wallet } from 'src/database/entities';
import { Helpers } from 'src/common/utility.helpers';
import { LedgerService } from 'src/modules/ledgers/services/ledgers/ledgers.service';
import { GenericObjectType } from 'src/common/generic-object';
import {
  ICreditRequestPayload,
  ICreditResponsePayload,
  IDebitRequestPayload,
  IDebitResponsePayload,
} from '../../interfaces/wallet.interface';
import { TransactionStatus, TransactionType } from '../../enums/wallet.enum';

@Injectable()
export class WalletService {
  protected readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly walletRepository: WalletRepository,
    private readonly ledgerService: LedgerService,
  ) {}

  async creditWallet(
    queryObject: GenericObjectType,
    payload: ICreditRequestPayload,
  ): Promise<ICreditResponsePayload> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    // await queryRunner.startTransaction('SERIALIZABLE');
    await queryRunner.startTransaction();

    try {
      // Locks the wallet row to prevent race conditions.
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: queryObject,
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({ balance: () => 'balance + :amount' })
        .where('id = :id', { id: wallet.id })
        .setParameters({ amount: payload.amount })
        .execute();

      const balanceAfter = Helpers.sumAmountFormatter(
        wallet.balance,
        +payload.amount,
      );

      await this.ledgerService.create(
        {
          user_id: wallet.user_id,
          amount: +payload.amount,
          balance_before: wallet.balance,
          balance_after: balanceAfter,
          type: payload.transaction_type,
          transaction_id: payload.transaction_id,
        },
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return {
        user_id: payload.user_id,
        payment_reference: Helpers.generatReference(),
        amount: +payload.amount,
        balance_before: wallet.balance,
        balance_after: balanceAfter,
        balance: wallet.balance,
        status: TransactionStatus.SUCCESSFUL,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error crediting wallet: ${error.message}`,
        error.stack,
      );

      throw new HttpException(
        'Error occured during top-up',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async debitWallet(
    queryObject: GenericObjectType,
    payload: IDebitRequestPayload,
  ): Promise<IDebitResponsePayload> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: queryObject,
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
      }

      if (Number(wallet.balance) < Number(payload.amount)) {
        throw new HttpException(
          'Transaction failed due to insufficient wallet balance',
          HttpStatus.NOT_FOUND,
        );
      }

      const updateResult = await queryRunner.manager
        .createQueryBuilder()
        .update(Wallet)
        .set({ balance: () => 'balance - :amount' })
        .where('id = :id AND balance >= :amount', {
          id: wallet.id,
          amount: payload.amount,
        })
        .execute();

      if (updateResult.affected === 0) {
        throw new HttpException('Wallet charge failed', HttpStatus.BAD_REQUEST);
      }

      const balanceAfter = Helpers.subtractAmountFormatter(
        wallet.balance,
        payload.amount,
      );

      await this.ledgerService.create(
        {
          user_id: wallet.user_id,
          amount: payload.amount,
          balance_after: balanceAfter,
          balance_before: wallet.balance,
          type: TransactionType.DEBIT,
          transaction_id: payload.transaction_id,
        },
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return this.buildSuccessResponse(payload, wallet.balance);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      this.logger.error(`Error debiting wallet: ${error.message}`, error.stack);

      return {
        status: TransactionStatus.FAILED,
        user_id: payload.user_id,
        payment_reference: null,
        amount: payload.amount,
        balance: null,
      };
    } finally {
      await queryRunner.release();
    }
  }

  private buildSuccessResponse(
    payload: IDebitRequestPayload,
    balance: number,
  ): IDebitResponsePayload {
    const response: IDebitResponsePayload = {
      status: TransactionStatus.SUCCESSFUL,
      user_id: payload.user_id,
      payment_reference: Helpers.generatReference(),
      amount: payload.amount,
      balance,
    };

    return response;
  }

  async create(
    payload: Partial<Wallet>,
    queryRunner?: QueryRunner,
  ): Promise<Wallet> {
    return await this.walletRepository.create(payload, queryRunner);
  }

  async findOne(
    query: GenericObjectType,
    throwError = false,
  ): Promise<Partial<Wallet>> {
    const existingWallet = await this.walletRepository.findOne(query);

    if (throwError && !existingWallet) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return existingWallet.toPayload();
  }

  async update(query: GenericObjectType, data: Partial<Wallet>): Promise<void> {
    await this.walletRepository.update(query, data);
  }
}
