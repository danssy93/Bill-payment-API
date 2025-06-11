import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Wallet } from './Wallet';
import { PowerTransaction } from './PowerTransaction';
import { Ledger } from './Ledger';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @CreateDateColumn({ nullable: true, type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ nullable: true, type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  @JoinColumn()
  wallet: Wallet;

  @OneToMany(
    () => PowerTransaction,
    (power_transactions) => power_transactions.user,
  )
  power_transactions: PowerTransaction[];

  @OneToMany(() => Ledger, (ledgers) => ledgers.user)
  ledgers: Ledger[];
}
