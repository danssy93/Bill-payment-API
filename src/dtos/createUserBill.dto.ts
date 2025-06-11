import { IsNumber } from 'class-validator';

export class CreateUserBillDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  balance: number;
}
