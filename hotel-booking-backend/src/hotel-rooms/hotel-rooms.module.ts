import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelRoom, HotelRoomSchema } from '../schemas/hotel-room.schema';
import { Hotel, HotelSchema } from '../schemas/hotel.schema';
import { HotelRoomsController } from './hotel-rooms.controller';
import { HotelRoomsService } from './hotel-rooms.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HotelRoom.name, schema: HotelRoomSchema }]),
    MongooseModule.forFeature([{ name: Hotel.name, schema: HotelSchema }]),
  ],
  controllers: [HotelRoomsController],
  providers: [HotelRoomsService],
})
export class HotelRoomsModule {}