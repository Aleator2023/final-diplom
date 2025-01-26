import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateClientDto } from '../dto/create-client.dto';
import * as bcrypt from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerClient(@Body() createClientDto: CreateClientDto) {
    try {
      const passwordHash = await bcrypt.hash(createClientDto.password, 10); // Хэшируем пароль
      const user = await this.authService.register({
        ...createClientDto,
        password: passwordHash,
      });

      return user;
    } catch (error) {
      console.log(error?.response);
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
