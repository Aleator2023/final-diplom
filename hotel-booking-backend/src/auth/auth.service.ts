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

  async register(userDto) {
    const { email, password, name, contactPhone } = userDto;
    // Проверка, существует ли пользователь с данным email
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    try {
      const newUser = await this.usersService.create({
        email,
        password, // Сохраняем хэшированный пароль
        name,
        contactPhone,
      });

      return newUser;
    } catch (error) {
      return error;
    }
  }

  // Метод для валидации пользователя
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
