import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateClientDto } from '../dto/create-client.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userDto: CreateClientDto) {
    const { email, password, name, contactPhone, role = 'client' } = userDto;
    
    try {
      // Проверка, существует ли пользователь с данным email
      const existingUser = await this.usersService.findByEmail(email);
    
      if (existingUser) {
        throw new UnauthorizedException('Email already in use');
      }

      const newUser = await this.usersService.create({
        email,
        password,
        name,
        contactPhone,
        role: role ?? 'client' // Присвоить 'client' если role не указана
      });

      return newUser;
    } catch (error) {
      console.error('Error during registration:', error.message); // Логируем сообщение об ошибке
      throw new UnauthorizedException('auth.service.ts. Registration failed');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,  // Добавляем роль пользователя в токен
    };

    return {
      access_token: this.jwtService.sign(payload),
      id: user._id,
    };
  }
}