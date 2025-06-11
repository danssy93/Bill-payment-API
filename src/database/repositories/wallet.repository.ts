import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Wallet } from '../entities';

@Injectable()
export class WalletRepository extends BaseRepository<Wallet> {
  protected readonly logger = new Logger(Wallet.name);

  constructor(
    @InjectRepository(Wallet)
    readonly walletRepository: Repository<Wallet>,
  ) {
    super(walletRepository);
  }
}
