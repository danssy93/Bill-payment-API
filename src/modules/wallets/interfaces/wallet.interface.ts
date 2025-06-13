import { TransactionStatus, TransactionType } from '../enums/wallet.enum';

export interface IDebitRequestPayload {
  user_id: number;
  amount: number;
  transaction_id: string;
}

export interface IDebitResponsePayload {
  message?: string;
  user_id: number;
  payment_reference?: string;
  balance?: number;
  amount?: number;
  status: TransactionStatus;
}

export interface ICreditRequestPayload {
  user_id: number;
  wallet_id?: number;
  amount: number;
  transaction_id: string;
  transaction_type: TransactionType;
}

export interface ICreditResponsePayload {
  user_id: number;
  payment_reference: string;
  balance: number;
  amount: number;
  balance_before: number;
  balance_after: number;
  status: TransactionStatus;
}
