import { Injectable, NotFoundException } from '@nestjs/common';
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
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: Partial<User> & { password?: string }): Promise<UserDocument> {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    const newUser = new this.userModel({
      ...data,
      passwordHash,
    });

    return newUser.save();
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
    console.log(`Looking for email: ${email}`); // Логирование поиска
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findAll(params: SearchUserParams): Promise<UserDocument[]> {
    const query = this.userModel.find();

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
  }

  async createAdmin(data: Partial<User> & { password?: string }): Promise<UserDocument> {
    const existingAdmin = await this.userModel.findOne({ email: data.email, role: 'admin' }).exec();
    if (existingAdmin) {
      throw new Error('Admin with this email already exists');
    }
  
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
  
    const newAdmin = new this.userModel({
      ...data,
      passwordHash,
    });
  
    return newAdmin.save();
  }

  async delete(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) {
    throw new NotFoundException('Invalid user ID');
  }

  const result = await this.userModel.deleteOne({ _id: id }).exec();
  if (result.deletedCount === 0) {
    throw new NotFoundException('User not found');
  }
}
}