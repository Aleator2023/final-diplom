import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Hotel extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [Types.ObjectId], ref: 'HotelRoom' }) // Ссылочное поле на HotelRoom
  rooms: Types.ObjectId[];
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);

// Изменено название виртуального свойства на `populatedRooms`
HotelSchema.virtual('populatedRooms', {
  ref: 'HotelRoom',
  localField: '_id',
  foreignField: 'hotel', // Поле hotel в HotelRoom должно содержать ObjectId отеля
  justOne: false,
});