import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { LedgerService } from './services/ledgers/ledgers.service';

@Module({
  imports: [DatabaseModule.forFeature()],
  exports: [LedgerService],
  providers: [LedgerService],
})
export class LedgersModule {}
