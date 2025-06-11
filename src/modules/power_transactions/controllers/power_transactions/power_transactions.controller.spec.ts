import { Test, TestingModule } from '@nestjs/testing';
import { PowerTransactionController } from './power_transactions.controller';

describe('PowerTransactionController', () => {
  let controller: PowerTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PowerTransactionController],
    }).compile();

    controller = module.get<PowerTransactionController>(
      PowerTransactionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
