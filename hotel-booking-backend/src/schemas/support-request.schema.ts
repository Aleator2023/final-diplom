import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Message } from '../schemas/message.schema';

@Schema({ timestamps: true })
export class SupportRequest extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  user: Types.ObjectId;

  @Prop({ type: [Message], default: [] })
  messages: Message[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const SupportRequestSchema = SchemaFactory.createForClass(SupportRequest);