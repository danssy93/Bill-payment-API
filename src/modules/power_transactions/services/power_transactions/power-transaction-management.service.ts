import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  ApiFeatures,
  PaginatedResponse,
} from 'src/database/utils/pagination.service';
import { PowerTransaction } from 'src/database/entities';
import { PowerTransactionRepository } from 'src/database/repositories';
import { GenericObjectType } from 'src/common/generic-object';
import { BasePaginationDto } from '../../dtos/pagination.dto';

@Injectable()
export class PowerTransactionManagementService {
  private readonly logger = new Logger(PowerTransactionManagementService.name);

  constructor(
    private readonly powerTransactionRepository: PowerTransactionRepository,
  ) {}

  async create(
    payload: Partial<PowerTransaction>,
  ): Promise<Partial<PowerTransaction>> {
    const record = await this.powerTransactionRepository.create(
      payload as PowerTransaction,
    );

    return record.toPayload();
  }

  async update(
    queryObject: GenericObjectType,
    payload: Partial<PowerTransaction>,
  ) {
    const transaction = await this.findOne(queryObject, true);

    if (!transaction) {
      throw new HttpException(
        'An error occured processing your request, try again',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.powerTransactionRepository.update(queryObject, payload);
  }

  async findOne(
    queryObject: GenericObjectType,
    throwError = false,
  ): Promise<Partial<PowerTransaction>> {
    const record = await this.powerTransactionRepository.findOne(queryObject);

    if (!record && throwError) {
      throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
    }

    return record.toPayload();
  }

  async find(
    paginationDto: BasePaginationDto,
    userId?: string,
  ): Promise<PaginatedResponse<PowerTransaction>> {
    paginationDto['user_id'] = userId;

    return new ApiFeatures<PowerTransaction>(
      this.powerTransactionRepository.powerTransactionRepository,
      paginationDto,
    )
      .filter()
      .sort()
      .select([
        'id',
        'provider',
        'receiver',
        'amount',
        'date_completed',
        'commission_amount',
        'status',
        'user_id',
        'transaction_date',
        'transaction_id',
        'balance_before',
        'balance_after',
        'type',
      ])
      .paginate()
      .getResults();
  }

  async recentBeneficiaries(queryObject: GenericObjectType) {
    const query = this.powerTransactionRepository
      .createQueryBuilder('transaction')
      .select([
        'transaction.receiver',
        'transaction.provider',
        'transaction.customer_name',
      ])
      .where(queryObject)
      .orderBy('transaction.created_at', 'DESC')
      .limit(10);

    return query.getMany();
  }
}
