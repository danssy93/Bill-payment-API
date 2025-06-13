import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, IsPhoneNumber } from 'class-validator';

export class BaseLoginDto {
  @ApiProperty({
    example: '123456',
    required: true,
    title: '6-digit PIN',
  })
  @IsNotEmpty({ message: 'Login PIN is required' })
  @IsString({ message: 'Password must be a string' })
  @Matches(/^\d{6}$/, {
    message: 'Password must be a 6-digit PIN containing only numbers',
  })
  readonly password: string;

  @ApiProperty({
    example: '08012345678',
    title: ' Phone number',
    required: true,
  })
  @IsNotEmpty({ message: ' Phone number is required.' })
  @Matches(/^[^\s]+$/, { message: ' Phone number cannot be empty.' })
  @IsString({ message: ' Phone number must be a string' })
  @IsPhoneNumber('NG', { message: 'Invalid  Phone number format' })
  readonly phone: string;
}
