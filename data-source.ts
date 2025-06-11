import { PowerTransaction } from 'src/database/entities/PowerTransaction';
import { Ledger } from 'src/database/entities/Ledger';
import { User } from 'src/database/entities/User';
import { Wallet } from 'src/database/entities/Wallet';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'hardison1993',
  database: 'bill_vending_db',
  entities: [User, Wallet, PowerTransaction, Ledger],
  migrations: ['dist/migrations/*.js'],
});
