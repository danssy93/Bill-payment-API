import { Module } from '@nestjs/common';
import { LedgerController } from './controllers/ledgers/ledgers.controller';
import { LedgerService } from './services/ledgers/ledgers.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Ledger } from '../database/entities/Ledger';

@Module({
  imports: [TypeOrmModule.forFeature([Ledger]), UsersModule],
  exports: [LedgerService],
  controllers: [LedgerController],
  providers: [LedgerService],
})
export class LedgersModule {}
