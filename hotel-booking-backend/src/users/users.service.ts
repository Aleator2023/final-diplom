import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';

interface SearchUserParams {
  limit?: number;
  offset?: number;
  email?: string;
  name?: string;
  contactPhone?: string;
  search?: string; // Добавлено поле для полнотекстового поиска
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: Partial<User> & { password?: string }): Promise<UserDocument> {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    try {
      const newUser = new this.userModel({
        ...data,
        passwordHash: passwordHash,
      });
  
      return newUser.save();
    } catch (error) {
      console.error("Error creating user:", error);
      throw new InternalServerErrorException('Database error during user creation', error); 
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid user ID');
      }
    
      const result = await this.userModel.deleteOne({ _id: id }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      throw new Error(`Ошибка при удалении пользователя: ${error.message}`);
    }
  }


  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid user ID');
    }

    const user = await this.userModel.findById(new Types.ObjectId(id)).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    console.log(`Looking for email: ${email}`);
    const escapedEmail = email.toLowerCase().trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    return this.userModel.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } }).exec();
  }

  async findAll(params: SearchUserParams): Promise<UserDocument[]> {
    try {
      const query = this.userModel.find();

      if (params.search) {
        const searchRegex = new RegExp(escapeRegExp(params.search), 'i');
        query.or([
          { email: { $regex: searchRegex } },
          { name: { $regex: searchRegex } },
          { contactPhone: { $regex: searchRegex } },
          // Добавьте другие поля для поиска, если необходимо, например:
          // { address: { $regex: searchRegex } },
        ]);
      }
  
      if (params.email) {
        query.where('email').regex(new RegExp(escapeRegExp(params.email), 'i'));
      }
      if (params.name) {
        query.where('name').regex(new RegExp(escapeRegExp(params.name), 'i'));
      }
      if (params.contactPhone) {
        query.where('contactPhone').regex(new RegExp(escapeRegExp(params.contactPhone), 'i'));
      }
  
      if (typeof params.limit === 'number') {
        query.limit(params.limit);
      }
      if (typeof params.offset === 'number') {
        query.skip(params.offset);
      }
  
      return query.exec();
    } catch (error) {
      throw new Error(`Ошибка при получении пользователей: ${error.message}`);
    }
  }

  async searchUsers(params: SearchUserParams): Promise<UserDocument[]> {
    try {
      const query = this.userModel.find();

      if (params.search) {
        const searchRegex = new RegExp(escapeRegExp(params.search), 'i');
        query.or([
          { email: { $regex: searchRegex } },
          { name: { $regex: searchRegex } },
          { contactPhone: { $regex: searchRegex } },
          // Добавьте другие поля для поиска, если необходимо, например:
          // { address: { $regex: searchRegex } },
        ]);
      } else {
        // Если параметр search не указан, используем обычную фильтрацию
        if (params.email) {
          query.where('email').regex(new RegExp(escapeRegExp(params.email), 'i'));
        }
        if (params.name) {
          query.where('name').regex(new RegExp(escapeRegExp(params.name), 'i'));
        }
        if (params.contactPhone) {
          query.where('contactPhone').regex(new RegExp(escapeRegExp(params.contactPhone), 'i'));
        }
      }

      if (typeof params.limit === 'number') {
        query.limit(params.limit);
      }
      if (typeof params.offset === 'number') {
        query.skip(params.offset);
      }

      return query.exec();
    } catch (error) {
      throw new Error(`Ошибка при поиске пользователей: ${error.message}`);
    }
  }
}