import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth';
import { LedgersModule } from './modules/ledgers/ledgers.module';
import { PowerTransactionsModule } from './modules/power_transactions/power_transactions.module';
import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    PowerTransactionsModule,
    LedgersModule,
    WalletsModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
