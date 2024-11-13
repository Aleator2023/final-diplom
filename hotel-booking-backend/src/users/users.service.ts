import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../schemas/user.schema';


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
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(data: Partial<User> & { password?: string }): Promise<User> {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    
    const newUser = new this.userModel({
      ...data,
      passwordHash,
    });
    
    return newUser.save();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(params: SearchUserParams): Promise<User[]> {
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

}