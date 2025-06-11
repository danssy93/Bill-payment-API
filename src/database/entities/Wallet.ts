import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Ledger } from './Ledger';

@Entity({ name: 'wallets' })
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  user_id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  balance: number;

  @CreateDateColumn({ nullable: true, type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ nullable: true, type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn()
  user: User;

  @OneToMany(() => Ledger, (ledgers) => ledgers.wallet)
  ledgers: Ledger;

  toPayload(): Partial<Wallet> {
    return {
      id: this.id,
      balance: this.balance,
      created_at: this.created_at,
    };
  }
}
