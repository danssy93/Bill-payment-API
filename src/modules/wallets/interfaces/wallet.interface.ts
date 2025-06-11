import { TransactionStatus, TransactionType } from '../enums/wallet.enum';

export interface IDebitRequestPayload {
  user_id: string;
  amount: number;
  charge_amount: number;
  transaction_id: string;
}

export interface IDebitResponsePayload {
  message?: string;
  user_id: string;
  payment_reference: string;
  balance: number;
  amount: number;
  amount_charged: number;
  balance_before: number;
  balance_after: number;
  status: TransactionStatus;
}

export interface ICreditRequestPayload {
  user_id?: string;
  wallet_id?: string;
  amount: number;
  transaction_id: string;
  transaction_type: TransactionType;
}

export interface ICreditResponsePayload {
  user_id: string;
  payment_reference: string;
  balance: number;
  amount: number;
  balance_before: number;
  balance_after: number;
  status: TransactionStatus;
}
