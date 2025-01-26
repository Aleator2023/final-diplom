import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Hotel } from './hotel.schema';

@Schema({ timestamps: true })
export class HotelRoom extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true })
  hotel: Types.ObjectId;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: true })
  isEnabled: boolean;
}

export const HotelRoomSchema = SchemaFactory.createForClass(HotelRoom);