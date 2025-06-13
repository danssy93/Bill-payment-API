import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth';
import { LedgersModule } from './modules/ledgers/ledgers.module';
import { PowerTransactionsModule } from './modules/power_transactions/power_transactions.module';
import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { CronJobModule } from './modules/cron-job/cron-job.module';
import { HttpExceptionFilter } from './common/global-exception.filter';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    PowerTransactionsModule,
    LedgersModule,
    WalletsModule,
    AuthModule,
    CronJobModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
