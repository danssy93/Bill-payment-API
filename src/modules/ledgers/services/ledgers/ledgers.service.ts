// src/ledgers/services/ledgers/ledgers.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ledger } from 'src/database/entities/Ledger.entity';
import { Repository, QueryRunner } from 'typeorm';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(Ledger)
    private readonly ledgerRepository: Repository<Ledger>,
  ) {}

  async create(
    payload: Partial<Ledger>,
    queryRunner?: QueryRunner,
  ): Promise<Ledger> {
    const ledger = this.ledgerRepository.create(payload);
    return queryRunner
      ? await queryRunner.manager.save(ledger)
      : await this.ledgerRepository.save(ledger);
  }

  async findOne(query: Partial<Ledger>): Promise<Ledger | null> {
    return this.ledgerRepository.findOneBy(query);
  }
}
