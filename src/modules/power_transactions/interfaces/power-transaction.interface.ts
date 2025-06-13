import { TransactionStatus } from 'src/modules/wallets/enums/wallet.enum';

export interface IValidatePowerResponse {
  status: TransactionStatus;
  message: string;
  clientResponse?: IPowerValidationResponse;
}

export interface IPowerValidationResponse {
  provider: string;
  meter_number: string;
  created_at: Date;
  amount: string;
  status: TransactionStatus;
  transaction_id: string;
  customer_name: string;
  customer_address: string;
  meter_type: string;
}

export interface IVendPowerResponse {
  message: string;
  status: TransactionStatus;
  payload: IVendPowerResponsePayload;
}

export interface IVendPowerResponsePayload {
  amount: number;
  meter_number: string;
  provider: string;
  created_at: string;
  transaction_id: string;
  status: TransactionStatus;
}
