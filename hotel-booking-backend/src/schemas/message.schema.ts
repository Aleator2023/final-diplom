import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'sentAt' } })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  author: Types.ObjectId;

  @Prop({ type: Date, required: true })
  sentAt: Date;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: Date, default: null })
  readAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);