import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsNotEmpty, Matches } from 'class-validator';
import { of } from 'rxjs';
import { PowerProviders, MeterTypes } from '../enums/power-provider.enums';

export class ValidateMeterRequestDto {
  @IsIn(Object.keys(PowerProviders), {
    message: `Provider must be one of ${PowerProviders}`,
  })
  @IsString()
  @IsNotEmpty({ message: 'Provider is required.' })
  @ApiProperty({
    description: 'Use AEDC, KEDC, IBEDC..',
    example: PowerProviders.IBEDC,
    title: 'Network Provider',
  })
  readonly provider: string;

  @IsNotEmpty({ message: 'Receiver is required.' })
  @IsString({ message: 'Receiver must be a string.' })
  @Matches(/^\d+$/, { message: 'Receiver must contain only numbers.' })
  @Matches(/^[^\s]+$/, { message: 'Receiver cannot be empty' })
  @ApiProperty({
    description: `Meter Number \n
    Use 0000000000 for invalid meter \n
    Use 10000000001 for failed simulation \n
    Use 10000000002 for in-progress simulation \n
    Use any random integer for valid meter number`,
    example: '1234133243',
    required: true,
    title: "Customer's meter number",
  })
  readonly meter_number: string;

  @IsIn(Object.keys(MeterTypes), { message: 'Invalid meter type provided' })
  @IsNotEmpty({ message: 'Meter type is required.' })
  @IsString({ message: 'Meter type must be a string' })
  @Matches(/^[^\s]+$/, { message: 'Meter type cannot be empty' })
  @ApiProperty({
    description: 'Use PREPAID or POSTPAID',
    example: 'PREPAID',
    required: true,
    title: 'Meter Types',
  })
  readonly meter_type: MeterTypes;
  receiver: any;
  amount: any;
}
