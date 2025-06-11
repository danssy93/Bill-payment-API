import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';
import { BaseLoginDto } from 'src/modules/common-module';

export class CustomerLoginDto extends BaseLoginDto {
  @ApiProperty({
    title: 'Device ID',
    example: '1234567890',
    required: true,
  })
  @IsString({ message: 'Device must be a string' })
  @IsNotEmpty({ message: 'Device is required.' })
  @Matches(/^[^\s]+$/, { message: 'Device cannot contain whitespace.' })
  readonly device: string;

  @ApiProperty({
    title: 'FCM token',
    example: '889badaf-6b42-4312-a8e8-b994a3d37d22',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'FCM token must be a string' })
  @IsNotEmpty({ message: 'FCM token is required.' })
  @Matches(/^[^\s]+$/, { message: 'FCM token cannot contain whitespace.' })
  readonly fcm_token?: string;
}
