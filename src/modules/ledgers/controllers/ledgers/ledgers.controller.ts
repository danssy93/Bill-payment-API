import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Ledger } from 'src/database/entities';
import { LedgerService } from 'src/ledgers/services/ledgers/ledgers.service';

@ApiTags('Ledger')
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get(':transaction_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a ledger entry by transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Ledger entry retrieved successfully',
    type: Ledger,
  })
  async getLedgerByTransactionId(
    @Param('transaction_id') transactionId: string,
  ): Promise<Ledger> {
    const ledger = await this.ledgerService.findOne({
      transaction_id: transactionId,
    });

    if (!ledger) {
      throw new NotFoundException('Ledger entry not found');
    }

    return ledger;
  }
}
