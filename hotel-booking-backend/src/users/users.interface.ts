import { Types } from 'mongoose';
import { User } from '../schemas/user.schema';

export interface SearchUserParams {
  limit?: number;
  offset?: number;
  email?: string;
  name?: string;
  contactPhone?: string;
}

export interface IUserService {
  create(
    data: Partial<User> & { password?: string },
  ): Promise<User & { _id: Types.ObjectId }>;
  findById(id: string): Promise<User & { _id: Types.ObjectId }>;
  findByEmail(email: string): Promise<(User & { _id: Types.ObjectId }) | null>;
  findOne(email: string): Promise<(User & { _id: Types.ObjectId }) | null>;
  findAll(
    params: SearchUserParams,
  ): Promise<(User & { _id: Types.ObjectId })[]>;
}
