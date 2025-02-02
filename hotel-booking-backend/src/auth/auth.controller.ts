import { Controller, Post, Body, UnauthorizedException, BadRequestException, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateClientDto } from '../dto/create-client.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async registerClient(@Body() createClientDto: CreateClientDto) {
    try {
      const user = await this.authService.register(createClientDto);

      return user;
    } catch (error) {
      if (error.message === 'Admin with this email already exists'){
        throw new BadRequestException('Admin with this email already exists');
      }

      if (error.message === 'Email already in use') {
        throw new BadRequestException('Email is already in use');
      }

      throw new BadRequestException('auth.controller.ts. Registration failed');
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException('Login failed');
    }

    return this.authService.login(user);
  }
}
