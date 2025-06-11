import { ICommissionResult } from 'src/database/entities';
import { TransactionStatus } from '../enums/transaction-status.enum';

export interface IValidatePowerResponse {
  status: TransactionStatus;
  message: string;
  clientResponse?: IPowerValidationResponse;
}

export interface IPowerValidationResponse {
  provider: string;
  receiver: string;
  transaction_date: string;
  amount: string;
  notification_phone?: string;
  // status: TransactionStatus;
  commission_breakdown: ICommissionResult;
  transaction_id: string;
  customer_name: string;
  customer_info: string;
  meter_type: string;
  logo?: string;
  minimum_purchase: string;
  maximum_purchase: string;
}

export interface IVendPowerResponse {
  message: string;
  status: TransactionStatus;
  payload: IVendPowerResponsePayload;
}

export interface IVendPowerResponsePayload {
  amount: number;
  receiver: string;
  provider: string;
  transaction_date: string;
  transaction_id: string;
  status: TransactionStatus;
  // payment_reference?: string;
  // wallet_balance_before?: number;
  // wallet_balance_after?: number;
  // notification_phone_number?: string;
  // commission_breakdown?: ICommissionResult;
}
