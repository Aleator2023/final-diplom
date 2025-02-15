import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Hotel } from './hotel.schema';
import { HotelRoom } from './hotel-room.schema';

@Schema({ timestamps: true })
export class Reservation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // ✅ Добавили ref: 'User'
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hotel', required: true }) // ✅ Теперь можно populate('hotel')
  hotel: Types.ObjectId | Hotel;

  @Prop({ type: Types.ObjectId, ref: 'HotelRoom', required: true }) // ✅ Теперь можно populate('room')
  room: Types.ObjectId | HotelRoom;

  @Prop({ type: Date, required: true })
  dateStart: Date;

  @Prop({ type: Date, required: true })
  dateEnd: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);