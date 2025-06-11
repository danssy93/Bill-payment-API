import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class PurchaseRequestDto {
  @IsNotEmpty({ message: 'Validation reference is required.' })
  @IsString()
  @ApiProperty({
    description: 'Transaction unique identifier',
    example: '240220219087',
    required: true,
    title: 'TransactionID',
  })
  readonly transaction_id: string;

  @IsNotEmpty({ message: 'Amount is required.' })
  @IsNumber()
  @Min(100, { message: 'The minimum amount is 100.' })
  @ApiProperty({
    description: 'Amount to purchase',
    example: 100,
    required: true,
  })
  readonly amount: number;
}
