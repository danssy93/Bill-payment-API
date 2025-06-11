import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { PowerTransaction } from '../entities';

@Injectable()
export class UserRepository extends BaseRepository<PowerTransaction> {
  protected readonly logger = new Logger(PowerTransactionRepository.name);

  constructor(
    @InjectRepository(PowerTransaction)
    readonly powerTransactionRepository: Repository<PowerTransaction>,
  ) {
    super(powerTransactionRepository);
  }
}
