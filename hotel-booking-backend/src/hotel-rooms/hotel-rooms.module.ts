import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelsAvailabilityService } from './hotels-availability.service';
import { HotelsAvailabilityController } from './hotelsAvailability.controller';
import { Reservation, ReservationSchema } from '../schemas/reservation.schema';
import { HotelRoomsController } from './hotel-rooms.controller';
import { HotelRoomsService } from './hotel-rooms.service';
import { HotelRoom, HotelRoomSchema } from '../schemas/hotel-room.schema';
import { HotelsModule } from '../hotels/hotels.module';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: HotelRoom.name, schema: HotelRoomSchema }, // ✅ Добавлено
    ]),
    ReservationsModule,
    HotelsModule,
  ],
  controllers: [
    HotelsAvailabilityController,
    HotelRoomsController, // ✅ Добавлено
  ],
  providers: [
    HotelsAvailabilityService,
    HotelRoomsService, // ✅ Добавлено
  ],
  exports: [HotelsAvailabilityService, HotelRoomsService], // ✅ Экспортируем сервис
})
export class HotelRoomsModule {}