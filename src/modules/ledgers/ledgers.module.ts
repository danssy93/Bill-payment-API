import { Module } from '@nestjs/common';
import { LedgerController } from './controllers/ledgers/ledgers.controller';
import { LedgerService } from './services/ledgers/ledgers.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule.forFeature()],
  exports: [LedgerService],
  controllers: [LedgerController],
  providers: [LedgerService],
})
export class LedgersModule {}
