import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ICreditRequestPayload,
  IDebitRequestPayload,
} from '../../interfaces/wallet.interface';
import { WalletService } from '../../services/wallets/wallets.service';

@ApiTags('Wallet')
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('credit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Credit a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet credited successfully' })
  async creditWallet(@Body() payload: ICreditRequestPayload) {
    const query = { user_id: payload.user_id }; // Adjust as necessary
    return await this.walletService.creditWallet(query, payload);
  }

  @Post('debit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Debit a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet debited successfully' })
  async debitWallet(@Body() payload: IDebitRequestPayload) {
    const query = { user_id: payload.user_id }; // Adjust as necessary
    return await this.walletService.debitWallet(query, payload);
  }
}
