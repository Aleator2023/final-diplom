import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User &
  Document & { _id: Types.ObjectId; password?: string };

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  contactPhone?: string;

  @Prop({ required: true, default: 'client' })
  role: 'client' | 'admin' | 'manager';
}

export const UserSchema = SchemaFactory.createForClass(User);
