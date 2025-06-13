import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/database/entities';
import { UserRepository } from 'src/database/repositories';
import { WalletService } from 'src/modules/wallets/services/wallets/wallets.service';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { CreateUserDto } from '../../dtos/createUser.dto';

@Injectable()
export class UsersService {
  protected readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
    private readonly walletsService: WalletService,
  ) {}

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      id,
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async findOne(
    query: FindOptionsWhere<User> | FindOptionsWhere<User>[],
    throwError = true,
    options = null,
  ): Promise<Partial<User>> {
    const existingUser = await this.userRepository.findOne(query, options);

    if (throwError && !existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return existingUser;
  }

  async create(userDetails: CreateUserDto) {
    const existingUser = await this.findOne(
      { phone: userDetails.phone },
      false,
    );

    if (existingUser) {
      throw new HttpException(
        'A user with this phone number already exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const createdUser = await this.userRepository.create(
        {
          ...userDetails,
          created_at: new Date(),
        },
        queryRunner,
      );

      await this.walletsService.create(
        { user_id: createdUser.id },
        queryRunner,
      );

      await queryRunner.commitTransaction();

      return createdUser.toPayload();
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  update(id: number, updateUserDetails: Partial<User>) {
    return this.userRepository.update({ id }, { ...updateUserDetails });
  }
}
