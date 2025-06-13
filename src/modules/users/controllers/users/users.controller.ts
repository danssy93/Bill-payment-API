import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CreateUserDto } from '../../dtos/createUser.dto';
import { UpdateUserDto } from '../../dtos/updateUser.dto';
import { UsersService } from '../../services/users/users.service';
import { ResponseFormat } from 'src/common/ResponseFormat';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getById(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    return ResponseFormat.success(
      res,
      'User retrieved successfully',
      user.toPayload(),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(@Res() res: Response, @Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);

    return ResponseFormat.success(
      res,
      'User created successfully',
      user,
      HttpStatus.CREATED,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  async update(
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.findById(id); // throws if not found
    const updatedUser = await this.userService.update(id, updateUserDto);
    return ResponseFormat.success(
      res,
      'User updated successfully',
      updatedUser,
    );
  }
}
