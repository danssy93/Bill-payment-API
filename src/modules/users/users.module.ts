import { Module } from '@nestjs/common';
import { UsersService } from './services/users/users.service';
import { UsersController } from './controllers/users/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsModule } from '../wallets/wallets.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserRepository } from 'src/database/repositories';

@Module({
  imports: [DatabaseModule.forFeature(), WalletsModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
