import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    example: '08012345678',
    description: 'Phone number of the user (Nigerian format)',
  })
  @IsPhoneNumber('NG', {
    message: 'Phone number must be a valid Nigerian number',
  })
  phone: string;

  @ApiProperty({
    example: '123456',
    description: 'User password (min 6 characters)',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
