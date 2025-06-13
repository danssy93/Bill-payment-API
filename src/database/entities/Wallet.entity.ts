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
import { User } from './User.entity';
import { Ledger } from './Ledger.entity';
import { WALLETS } from '../DBTableNames';

@Entity({ name: WALLETS })
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  user_id: number;

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
