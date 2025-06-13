import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Wallet } from './Wallet.entity';
import { PowerTransaction } from './PowerTransaction.entity';
import { TransactionType } from 'src/modules/wallets/enums/wallet.enum';
import { LEDGER } from '../DBTableNames';

export enum PaymentType {
  FUNDING = 'funding',
  ELECTRICITY_PURCHASE = 'electricity_purchase',
}

@Entity({ name: LEDGER })
export class Ledger {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
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

  @Index()
  @Column({ type: 'varchar', length: 30 })
  type: TransactionType;

  @OneToOne(() => PowerTransaction, (pt) => pt.ledger)
  power_transaction: PowerTransaction;

  @ManyToOne(() => User, (user) => user.ledgers)
  user: User;

  @ManyToOne(() => Wallet, (wallet) => wallet.ledgers)
  wallet: Wallet;
}
