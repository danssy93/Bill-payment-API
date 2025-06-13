import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/database/entities';
import { UserRepository } from 'src/database/repositories';
import { WalletService } from 'src/modules/wallets/services/wallets/wallets.service';
import { DataSource, FindOptionsWhere } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
    private readonly walletsService: WalletService,
  ) {}

  // Fetch a user by ID with related wallet
  async findById(id: number) {
    const user = await this.userRepository.findOne(
      {
        id,
      },
      { relations: ['wallet'] },
    );

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

  async create(userDetails: Partial<User>) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newUser = await this.userRepository.create({
        ...userDetails,
        created_at: new Date(),
      });

      // Create wallet with initial balance of 0

      await this.walletsService.create({ user_id: newUser.id }, queryRunner);
      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  catch(userError) {
    throw new HttpException(
      'Failed to create user: ' + userError.message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  update(id: number, updateUserDetails: Partial<User>) {
    return this.userRepository.update({ id }, { ...updateUserDetails });
  }
}
