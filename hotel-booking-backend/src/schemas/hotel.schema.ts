import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Hotel extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);