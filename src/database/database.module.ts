import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './datasource';
import { Ledger, PowerTransaction, User, Wallet } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const logger = new Logger('DatabaseModule');
        try {
          logger.log('Connected to the database');
          return dataSourceOptions;
        } catch (error) {
          logger.error('Database connection failed', error.stack);
          throw error;
        }
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  static forFeature() {
    return TypeOrmModule.forFeature([PowerTransaction, User, Wallet, Ledger]);
  }
}
