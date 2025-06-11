import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Ledger } from './Ledger';
import {
  PaymentMode,
  TransactionStatus,
} from 'src/modules/power_transactions/enums/transaction-status.enum';
import { MeterTypes } from 'src/modules/power_transactions/enums/power-provider.enums';

@Entity({ name: 'power_transactions' })
export class PowerTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ length: 80 })
  @Index()
  provider: string;

  @Column({ length: 25 })
  @Index()
  meter_number: string;

  @Column({ length: 20, type: 'varchar', nullable: true })
  units: string;

  @Column({ length: 50, type: 'varchar', nullable: true })
  token: string;

  @Index()
  @Column({ type: 'enum', enum: MeterTypes, nullable: true })
  meter_type: MeterTypes;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    unsigned: true,
    nullable: true,
  })
  @Index()
  amount: number;

  @Column({ default: false })
  paid: boolean;

  @CreateDateColumn({ nullable: true, type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ nullable: true, type: 'timestamp' })
  updated_at: Date;

  @Index()
  @Column({ length: 40, nullable: true })
  payment_reference: string;

  @Index()
  @Column({ type: 'enum', enum: PaymentMode, nullable: true })
  payment_mode: PaymentMode;

  @Index()
  @Column({ length: 50, nullable: true })
  transaction_id: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @Index()
  status: TransactionStatus;

  @Column({ length: 100, type: 'varchar', nullable: true })
  customer_address: string;

  @Column({ length: 100, type: 'varchar', nullable: true })
  customer_name: string;

  @ManyToOne(() => User, (user) => user.power_transactions, { eager: false })
  user: User;

  @OneToOne(() => Ledger, (ledger) => ledger.power_transaction)
  ledger: Ledger;

  toPayload(): Partial<PowerTransaction> {
    return {
      id: this.id,
      provider: this.provider,
      meter_number: this.meter_number,
      meter_type: this.meter_type,
      amount: this.amount,
      payment_reference: this.payment_reference,
      transaction_id: this.transaction_id,
      status: this.status,
      created_at: this.created_at,
      token: this.token,
      units: this.units,
      customer_name: this.customer_name,
      customer_address: this.customer_address,
    };
  }
}
