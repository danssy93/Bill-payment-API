import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ResponseFormat } from 'src/shared';
import { ValidateMeterRequestDto } from 'src/modules/power_transactions/dtos/validate-meter.dto';
import { PurchaseRequestDto } from 'src/modules/power_transactions/dtos/purchase.dto';
import { User } from 'src/database/entities/User';
import { PowerDiscoProviders } from 'src/modules/power_transactions/enums/power-provider.enums';
import { TransactionStatus } from 'src/modules/power_transactions/enums/transaction-status.enum';
import { PowerTransactionService } from 'src/modules/power_transactions/services/power_transactions/power_transactions.service';
import { CustomerJwtGuard } from 'src/auth/guards';
import { CurrentUser } from 'src/common/current-user.guard';

@ApiTags('Customer Power Purchase Module')
@Controller('power')
@ApiBearerAuth('CustomerJWT')
@UseGuards(CustomerJwtGuard)
export class PowerTransactionController {
  constructor(private readonly powerService: PowerTransactionService) {}

  @ApiOkResponse({
    description: 'Successful',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden',
  })
  @Get('providers')
  async fetchProviders(@Res() res: Response) {
    ResponseFormat.success(res, 'Successful', PowerDiscoProviders);
  }

  @ApiOkResponse({
    description: 'Verification Successful',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBody({ type: ValidateMeterRequestDto })
  @Post('verify-meter')
  async initiate(
    @CurrentUser() user: User,
    @Res() res: Response,
    @Body() powerDto: ValidateMeterRequestDto,
  ) {
    const { status, message, clientResponse } =
      await this.powerService.initiate(powerDto, user);

    if (status === TransactionStatus.SUCCESSFUL) {
      return ResponseFormat.success(res, message, clientResponse);
    }

    return ResponseFormat.failure(res, message);
  }

  @ApiOkResponse({
    description: 'Successful',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  @ApiAcceptedResponse({
    description: 'Accepted',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiBody({ type: PurchaseRequestDto })
  @Post('purchase')
  async purchase(
    @Res() res: Response,
    @Body() purchasePowerDto: PurchaseRequestDto,
    @CurrentUser() user: User,
  ) {
    const { message, status, payload } = await this.powerService.vend(
      purchasePowerDto,
      user,
    );

    if (status == TransactionStatus.SUCCESSFUL) {
      return ResponseFormat.success(res, message, payload);
    }

    if (status == TransactionStatus.IN_PROGRESS) {
      return ResponseFormat.success(res, message, payload, HttpStatus.ACCEPTED);
    }

    return ResponseFormat.success(
      res,
      message,
      payload,
      HttpStatus.EXPECTATION_FAILED,
    );
  }
}
