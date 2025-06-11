import { Test, TestingModule } from '@nestjs/testing';
import { PowerTransactionService } from './power_transactions.service';

describe('BillsService', () => {
  let service: PowerTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PowerTransactionService],
    }).compile();

    service = module.get<PowerTransactionService>(PowerTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
