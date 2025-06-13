import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/database/entities';
import { PurchaseRequestDto } from 'src/modules/power_transactions/dtos/purchase.dto';
import { ValidateMeterRequestDto } from 'src/modules/power_transactions/dtos/validate-meter.dto';
import {
  IPowerValidationResponse,
  IValidatePowerResponse,
  IVendPowerResponse,
} from 'src/modules/power_transactions/interfaces';
import { Helpers } from 'src/common/utility.helpers';
import { IDebitResponsePayload } from 'src/modules/wallets/interfaces/wallet.interface';
import {
  TransactionStatus,
  TransactionType,
} from 'src/modules/wallets/enums/wallet.enum';
import { WalletService } from 'src/modules/wallets/services/wallets/wallets.service';
import { PowerTransactionManagementService } from './power-transaction-management.service';

@Injectable()
export class PowerTransactionService {
  private readonly logger = new Logger(PowerTransactionService.name);

  private readonly FAILED_TRANSACTION = '0000000000';
  private readonly IN_PROGRESS = '0000000001';

  constructor(
    private readonly managePowerService: PowerTransactionManagementService,
    private readonly paymentModeService: WalletService,
  ) {}

  async initiate(
    payload: ValidateMeterRequestDto,
    user: User,
  ): Promise<IValidatePowerResponse> {
    const { id } = user;

    const dateCreated = new Date(Helpers.getWATDateTimestamp());
    const transactionId = Helpers.generatReference();

    await this.managePowerService.create({
      user_id: id,
      ...payload,
      created_at: dateCreated,
      transaction_id: transactionId,
    });

    const validateResponse = {
      customer_name: 'JOHN DOE',
      customer_address: 'FCT ABUJA',
      status: TransactionStatus.PENDING,
    };

    const clientResponse: IPowerValidationResponse = {
      meter_number: payload.meter_number,
      provider: payload.provider,
      transaction_id: transactionId,
      customer_name: validateResponse.customer_name,
      customer_address: validateResponse.customer_address,
      meter_type: payload.meter_type,
      created_at: dateCreated,
      status: validateResponse.status,
    };

    await this.managePowerService.update(
      { transaction_id: transactionId, user_id: id },
      {
        customer_name: validateResponse.customer_name,
        customer_address: validateResponse.customer_address,
        updated_at: dateCreated,
      },
    );

    if (validateResponse.status === TransactionStatus.FAILED) {
      return {
        status: TransactionStatus.FAILED,
        message: 'Validation failed',
      };
    }

    return {
      status: TransactionStatus.SUCCESSFUL,
      message: 'Validation successful',
      clientResponse,
    };
  }

  async vend(payload: PurchaseRequestDto, user): Promise<IVendPowerResponse> {
    const { id: userId } = user;

    const transaction = await this.managePowerService.findOne(
      {
        transaction_id: payload.transaction_id,
        user_id: userId,
      },
      true,
    );

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new HttpException(
        'Transaction already processed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const paymentResponse: IDebitResponsePayload =
      await this.paymentModeService.debitWallet(
        {
          user_id: userId,
        },
        {
          user_id: userId,
          amount: payload.amount,
          transaction_id: transaction.transaction_id,
        },
      );

    if (paymentResponse.status === TransactionStatus.FAILED) {
      const dateUpdated = new Date(Helpers.getWATDateTimestamp());

      await this.managePowerService.update(
        { user_id: userId, transaction_id: transaction.transaction_id },
        {
          status: TransactionStatus.FAILED,
          amount: paymentResponse.amount,
          updated_at: dateUpdated,
          transaction_type: TransactionType.CREDIT,
        },
      );

      return {
        message: paymentResponse.message,
        status: TransactionStatus.FAILED,
        payload: {
          token: 'N/A',
          units: 'N/A',
          amount: payload.amount,
          meter_number: transaction.meter_number,
          transaction_id: payload.transaction_id,
          status: TransactionStatus.FAILED,
          created_at: transaction.created_at.toLocaleString(),
          provider: transaction.provider,
        },
      };
    }

    let status: TransactionStatus;
    switch (transaction.meter_number) {
      case this.FAILED_TRANSACTION:
        status = TransactionStatus.FAILED;
        break;
      case this.IN_PROGRESS:
        status = TransactionStatus.IN_PROGRESS;
        break;
      default:
        status = TransactionStatus.SUCCESSFUL;
        break;
    }

    const vendResponse = {
      phone_number: '07084354773',
      amount: payload.amount,
      network: 'ABUJA DISCO Prepaid',
      code: '200',
      tx_ref: 'CF-FLYAPI-20250510012956756440205',
      reference: transaction.transaction_id,
      token: '2099-0067-6182-3425-9586',
      units: '10',
      status,
    };

    let message: string;
    let is_resolved: boolean;
    let transactionStatus: TransactionStatus;
    if (vendResponse.status == TransactionStatus.SUCCESSFUL) {
      transactionStatus = TransactionStatus.SUCCESSFUL;
      message = 'Transaction successful';
      is_resolved = true;
    } else if (vendResponse.status == TransactionStatus.FAILED) {
      transactionStatus = TransactionStatus.FAILED;
      message = 'Transaction failed, try again';
      is_resolved = false;
    } else {
      transactionStatus = TransactionStatus.IN_PROGRESS;
      message = 'Transaction in progress';
      is_resolved = false;
    }

    const clientResponse: IVendPowerResponse = {
      message,
      status: vendResponse.status,
      payload: {
        amount: payload.amount,
        token: vendResponse.token,
        units: vendResponse.units,
        meter_number: transaction.meter_number,
        transaction_id: payload.transaction_id,
        status: vendResponse.status,
        created_at: transaction.created_at.toLocaleString(),
        provider: transaction.provider,
      },
    };

    const dateUpdated = new Date(Helpers.getWATDateTimestamp());

    await this.managePowerService.update(
      { user_id: userId, transaction_id: transaction.transaction_id },
      {
        transaction_type: TransactionType.DEBIT,
        status: transactionStatus,
        token: vendResponse.token,
        units: vendResponse.units,
        payment_reference: paymentResponse.payment_reference,
        amount: paymentResponse.amount,
        updated_at: dateUpdated,
        is_resolved,
      },
    );

    return clientResponse;
  }
}
