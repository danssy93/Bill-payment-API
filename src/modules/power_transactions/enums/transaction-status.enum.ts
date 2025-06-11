export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  IN_PROGRESS = 'IN_PROGRESS',
  REVERSED = 'REVERSED',
}

export enum TransactionType {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  USSD = 'USSD',
  BANK_DEBIT = 'BANK_DEBIT',
  OTHERS = 'OTHERS',
  DEBIT = 'DEBIT',
}

export enum PaymentMode {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  USSD = 'USSD',
  BANK_DEBIT = 'BANK_DEBIT',
  OTHERS = 'OTHERS',
}
