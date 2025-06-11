import { IsNegative, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUserWalletDto {
  @IsNumber()
  @IsNotEmpty()
  @IsNegative()
  balance: number;
}
