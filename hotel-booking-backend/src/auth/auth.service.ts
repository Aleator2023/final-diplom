import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; // импорт сервиса пользователей для получения данных о пользователе
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(clientData: {
    email: string;
    password: string;
    name: string;
    contactPhone: string;
  }): Promise<any> {
    const { email, password, name, contactPhone } = clientData;
  
    // Проверка, существует ли пользователь с данным email
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }
  
    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 10);
  
    // Создание нового пользователя с ролью client
    const newUser = await this.usersService.create({
      email,
      passwordHash,
      name,
      contactPhone,
      role: 'client', // Устанавливаем роль client
    });
  
    // Возврат данных пользователя без пароля
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } 

  // Метод для валидации пользователя
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result; // возвращаем данные пользователя без хеша пароля
    }
    return null;
  }

  // Метод для входа (генерация JWT)
  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}