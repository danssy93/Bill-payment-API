import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Wallet } from './Wallet';
import { PowerTransaction } from './PowerTransaction';
import { LedgerServiceType } from 'src/modules/ledgers/enums/ledger-type.enum';

export enum PaymentType {
  FUNDING = 'funding',
  ELECTRICITY_PURCHASE = 'electricity_purchase',
}

@Entity({ name: 'ledgers' })
export class Ledger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  meter_number: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  balance_before: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  balance_after: number;

  @CreateDateColumn()
  payment_date: Date;

  @Column({ length: 50, nullable: true })
  transaction_id: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'successful', 'failed', 'reversed'],
    default: 'pending',
  })
  status: 'pending' | 'successful' | 'failed' | 'reversed';

  @Column({
    type: 'enum',
    enum: LedgerServiceType,
    nullable: true,
  })
  service: LedgerServiceType;

  @OneToOne(() => PowerTransaction, (pt) => pt.ledger)
  power_transaction: PowerTransaction;

  @ManyToOne(() => User, (user) => user.ledgers)
  user: User;

  @ManyToOne(() => Wallet, (wallet) => wallet.ledgers)
  wallet: Wallet;
}
