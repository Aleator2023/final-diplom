import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userDto) {
    const { email, password, name, contactPhone } = userDto;
    
    // Проверка, существует ли пользователь с данным email
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    // Хешируем пароль перед созданием пользователя
    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const newUser = await this.usersService.create({
        email,
        passwordHash,
        name,
        contactPhone,
        role: 'client',
      });

      return newUser;
    } catch (error) {
      throw new UnauthorizedException('Registration failed');
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
    };
  }
}