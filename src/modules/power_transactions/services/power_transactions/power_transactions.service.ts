import { HttpStatus } from '@nestjs/common';
import { User } from 'src/database/entities';
import { PurchaseRequestDto } from 'src/modules/power_transactions/dtos/purchase.dto';
import { ValidateMeterRequestDto } from 'src/modules/power_transactions/dtos/validate-meter.dto';
import { PowerProviders } from 'src/modules/power_transactions/enums/power-provider.enums';
import { TransactionStatus } from 'src/modules/power_transactions/enums/transaction-status.enum';
import {
  IPowerValidationResponse,
  IValidatePowerResponse,
  IVendPowerResponse,
} from 'src/modules/power_transactions/interfaces';
import { Helpers } from 'src/common/utility.helpers';
import { WalletService } from 'wallets/wallets.service';

@Injectable()
export class PowerTransactionService {
  private readonly logger = new Logger(PowerTransactionService.name);

  constructor(
    private readonly managePowerService: PowerTransactionService,
    private readonly paymentModeService: WalletService,
  ) {}

  async initiate(
    payload: ValidateMeterRequestDto,
    user: User,
  ): Promise<IValidatePowerResponse> {
    const { id } = user;

    const rechargeType =
      `${payload.provider}_${payload.meter_type}_${ServiceType.POWER}`.toLowerCase();

    const commission: ICommissionResult =
      await this.commissionService.getUserCommission(
        id,
        rechargeType,
        payload.amount,
      );

    const dateCreated = new Date(Helpers.getWATDateTimestamp());

    const response = await this.managePowerService.create({
      user_id: id,
      ...payload,
      client_validation_request_payload: JSON.stringify(payload),
      transaction_date: dateCreated,
      created_at: dateCreated,
    });

    const transactionId = response.id.replace(/-/g, '').toUpperCase();

    const thirdPartyService: IBillPaymentService =
      await this.orchestratorService.getService(
        `${payload.provider}_${payload.meter_type}`.toLowerCase(),
      );

    const validateResponse = await thirdPartyService.verify({
      receiver: payload.receiver,
      service_type: ServiceType.POWER,
      provider: payload.provider,
      meter_type: payload.meter_type,
    });

    const clientResponse: IPowerValidationResponse = {
      minimum_purchase: validateResponse.validate_details.minimum_purchase,
      maximum_purchase: validateResponse.validate_details.maximum_purchase,
      receiver: payload.receiver,
      provider:
        payload.provider == PowerProviders.IKEJA
          ? 'Ikeja Electric'
          : payload.provider,
      transaction_id: transactionId,
      commission_breakdown: commission,
      amount: payload.amount.toString(),
      transaction_date: response.transaction_date.toLocaleString(),
      customer_name: validateResponse.validate_details.customer_name,
      customer_info: validateResponse.validate_details.customer_info,
      meter_type: payload.meter_type,
    };

    const dateUpdated = new Date(Helpers.getWATDateTimestamp());

    await this.managePowerService.update(
      { id: response.id, user_id: id },
      {
        minimum_purchase: validateResponse.validate_details.minimum_purchase,
        maximum_purchase: validateResponse.validate_details.maximum_purchase,
        customer_name: validateResponse.validate_details.customer_name,
        customer_info: validateResponse.validate_details.customer_info,
        transaction_id: transactionId,
        api_used: validateResponse.api_used,
        client_validation_request_payload: JSON.stringify(payload),
        client_validation_response_payload: JSON.stringify(clientResponse),
        api_validation_request_payload: JSON.stringify(
          validateResponse.api_request,
        ),
        api_validation_response_payload: JSON.stringify(
          validateResponse.api_response,
        ),
        date_modified: dateUpdated,
        date_completed: dateUpdated,
        updated_at: dateUpdated,
      },
    );

    if (validateResponse.validate_details.minimum_purchase > payload.amount) {
      return {
        status: TransactionStatus.FAILED,
        message: `The transaction amount must be at least ₦${validateResponse.validate_details.minimum_purchase}.`,
      };
    }

    if (validateResponse.validate_details.maximum_purchase < payload.amount) {
      return {
        status: TransactionStatus.FAILED,
        message: `The transaction amount must not exceed ₦${validateResponse.validate_details.maximum_purchase}.`,
      };
    }

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

  async vend(
    payload: PurchaseRequestDto,
    user: ICurrentUserDetails,
  ): Promise<IVendPowerResponse> {
    const { id: userId, email, phone } = user;
    payload.pin = '******';

    const transaction = await this.managePowerService.findOne(
      {
        transaction_id: payload.transaction_id,
        user_id: userId,
      },
      true,
    );

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new AppError(
        'Transaction already processed',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      transaction?.minimum_purchase &&
      parseFloat(transaction?.minimum_purchase) > transaction.amount
    ) {
      throw new AppError(
        `The amount you are trying to vend is less than the minimum vend amount of NGN${transaction.minimum_purchase}`,
        HttpStatus.EXPECTATION_FAILED,
      );
    }

    const thirdPartyService: IBillPaymentService =
      await this.orchestratorService.getService(
        `${transaction.provider}_${transaction.meter_type}`.toLowerCase(),
      );

    const rechargeType = `${transaction.provider.toUpperCase()}_${ServiceType.POWER}`;

    const commission: ICommissionResult =
      await this.commissionService.getUserCommission(
        userId,
        rechargeType,
        transaction.amount,
      );

    this.paymentModeService.setStrategy(UserType.CUSTOMER);

    const paymentResponse: IDebitResponsePayload =
      await this.paymentModeService.debitWallet(
        {
          user_id: userId,
          amount: commission.amount,
          charge_amount: commission.charge_amount,
          transaction_id: transaction.transaction_id,
          recharge_type: rechargeType,
          service: ServiceType.POWER,
        },
        { user_id: userId, type: WalletType.MAIN },
      );

    if (paymentResponse.status === TransactionStatus.FAILED) {
      const dateUpdated = new Date(Helpers.getWATDateTimestamp());

      await this.managePowerService.update(
        { user_id: userId, transaction_id: transaction.transaction_id },
        {
          is_resolved: false,
          status: TransactionStatus.FAILED,
          wallet_request_payload: paymentResponse.wallet_request_payload,
          wallet_response_payload: paymentResponse.wallet_response_payload,
          payment_mode:
            PaymentMode[this.paymentModeService.paymentMethod().toUpperCase()],
          amount: paymentResponse.amount,
          charge_amount: paymentResponse.amount_charged,
          date_completed: dateUpdated,
          date_modified: dateUpdated,
          updated_at: dateUpdated,
        },
      );

      return {
        message: paymentResponse.message,
        status: TransactionStatus.FAILED,
        payload: {
          amount: transaction.amount,
          receiver: transaction.receiver,
          transaction_id: payload.transaction_id,
          status: TransactionStatus.FAILED,
          transaction_date: transaction.transaction_date.toLocaleString(),
          provider: transaction.provider,
        },
      };
    }

    const apiReference = Helpers.generateRequestId();

    const vendResponse: IBillPaymentVendResponsePayload =
      await thirdPartyService.vend({
        receiver: transaction.receiver,
        amount: transaction.amount,
        provider: transaction.provider,
        service_type: ServiceType.POWER,
        api_reference: apiReference,
      });

    let message: string;
    let transactionStatus: TransactionStatus;
    if (vendResponse.status == TransactionStatus.SUCCESSFUL) {
      if (transaction.meter_type.toLowerCase() === MeterTypes.PREPAID) {
        const token = vendResponse?.vend_details
          ? vendResponse.vend_details?.token?.trim()
          : 'N/A';

        transactionStatus =
          token.toLowerCase() != 'n/a' && token.length > 8
            ? TransactionStatus.SUCCESSFUL
            : TransactionStatus.IN_PROGRESS;
      } else if (transaction.meter_type.toLowerCase() === MeterTypes.POSTPAID) {
        transactionStatus = TransactionStatus.SUCCESSFUL;
      } else {
        transactionStatus = TransactionStatus.IN_PROGRESS;
      }

      message = 'Transaction successful';
    } else if (vendResponse.status == TransactionStatus.FAILED) {
      transactionStatus = TransactionStatus.FAILED;

      message = 'Transaction failed, try again';
    } else if (vendResponse.status == TransactionStatus.IN_PROGRESS) {
      transactionStatus = TransactionStatus.IN_PROGRESS;

      message = 'Transaction in progress';
    }

    const clientResponse: IVendPowerResponse = {
      message,
      status: vendResponse.status,
      payload: {
        amount: transaction.amount,
        receiver: transaction.receiver,
        transaction_id: payload.transaction_id,
        status: vendResponse.status,
        transaction_date: transaction.transaction_date.toLocaleString(),
        provider: transaction.provider,
      },
    };

    const dateUpdated = new Date(Helpers.getWATDateTimestamp());

    const updatedTransaction = await this.managePowerService.update(
      { user_id: userId, transaction_id: transaction.transaction_id },
      {
        is_resolved:
          transactionStatus === TransactionStatus.SUCCESSFUL ? true : false,
        api_reference: apiReference,
        status: transactionStatus,
        token: vendResponse?.vend_details?.token,
        units: vendResponse?.vend_details?.units,
        api_vend_response_payload: JSON.stringify(vendResponse.api_response),
        api_vend_request_payload: JSON.stringify(vendResponse.api_request),
        payment_mode:
          PaymentMode[this.paymentModeService.paymentMethod().toUpperCase()],
        commission_percentage: commission.commission_percentage,
        commission_amount: commission.profit_amount.toString(),
        payment_reference: paymentResponse.payment_reference,
        amount: paymentResponse.amount,
        charge_amount: paymentResponse.amount_charged,
        balance_after: paymentResponse.balance_after,
        balance_before: paymentResponse.balance_before,
        client_vend_request_payload: JSON.stringify(payload),
        client_vend_response_payload: JSON.stringify(clientResponse),
        wallet_request_payload: paymentResponse.wallet_request_payload,
        wallet_response_payload: paymentResponse.wallet_response_payload,
        date_completed: dateUpdated,
        date_modified: dateUpdated,
        updated_at: dateUpdated,
      },
    );
  }
}
