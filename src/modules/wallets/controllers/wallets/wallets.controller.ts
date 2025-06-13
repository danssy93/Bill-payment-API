import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WalletService } from '../../services/wallets/wallets.service';
import { CustomerJwtGuard } from 'src/modules/auth/guards';
import { FundWalletDto } from '../../dtos/fundWallet.dto';
import { User } from 'src/database/entities';
import { CurrentUser } from 'src/common/current-user.guard';
import { Helpers } from 'src/common/utility.helpers';
import { TransactionType } from '../../enums/wallet.enum';
import { ResponseFormat } from 'src/common/ResponseFormat';
import { Response } from 'express';

@ApiTags('Wallet')
@Controller('wallets')
@ApiBearerAuth('CustomerJWT')
@UseGuards(CustomerJwtGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('credit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Credit a wallet' })
  @ApiResponse({ status: 200, description: 'Wallet credited successfully' })
  async creditWallet(
    @Res() res: Response,
    @Body() payload: FundWalletDto,
    @CurrentUser() user: User,
  ) {
    const query = { user_id: user.id };
    await this.walletService.creditWallet(query, {
      user_id: user.id,
      amount: payload.amount,
      transaction_id: Helpers.generatReference(),
      transaction_type: TransactionType.CREDIT,
    });

    return ResponseFormat.ok(res, 'Balance updated successfully');
  }
}
