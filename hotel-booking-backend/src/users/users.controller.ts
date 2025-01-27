import { Controller, Get, Post, Delete, Body, Param, Query, NotFoundException, UnauthorizedException, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDocument } from '../schemas/user.schema';
import { SearchUserParams } from './users.interface';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { AdminGuard } from '../auth/admin.guard';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() data: Partial<UserDocument>): Promise<{ id: string; email: string; name: string; role: string }> {
    const user = await this.usersService.create(data);
    return {
      id: user._id.toHexString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @Post('/create-admin')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    const adminData: Partial<UserDocument> = {
      ...createAdminDto,
      role: 'admin', // Указываем строго типизированное значение роли
    };
    const user = await this.usersService.create(adminData);
    return {
      id: user._id.toHexString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @Get('find-by-email')
  async findByEmail(@Query('email') encodedEmail: string): Promise<{ id: string; email: string; name: string; role: string }> {
    const email = decodeURIComponent(encodedEmail);
    console.log(`Search request received for email: ${email}`); // Логирование запроса
  
    const user: UserDocument | null = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return {
      id: user._id.toHexString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<{ id: string; email: string; name: string; contactPhone?: string; role: string }> {
    const user = await this.usersService.findById(id);
    return {
      id: user._id.toHexString(),
      email: user.email,
      name: user.name,
      contactPhone: user.contactPhone,
      role: user.role,
    };
  }

  
  @Get()
  async findAll(@Query() query: SearchUserParams) {
    try {
      const users = await this.usersService.findAll(query);
      return users.map((user) => ({
        id: user._id.toHexString(),
        email: user.email,
        name: user.name,
        contactPhone: user.contactPhone,
        role: user.role,
      }));
    } catch (error) {
      throw new NotFoundException('Users not found');
    }
  }
  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }
}