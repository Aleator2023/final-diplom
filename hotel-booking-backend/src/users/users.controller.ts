import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() data: Partial<User>): Promise<User> {
    return this.usersService.create(data);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Get()
  async findAll(
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
    @Query('email') email?: string,
    @Query('name') name?: string,
    @Query('contactPhone') contactPhone?: string,
  ): Promise<User[]> {
    return this.usersService.findAll({ limit, offset, email, name, contactPhone });
  }
}