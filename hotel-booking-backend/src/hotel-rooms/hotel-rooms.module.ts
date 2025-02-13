import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelsAvailabilityService } from './hotels-availability.service';
import { HotelsAvailabilityController } from './hotelsAvailability.controller';
import { Reservation, ReservationSchema } from '../schemas/reservation.schema';
import { HotelsModule } from '../hotels/hotels.module'; // ✅ Импортируем HotelsModule
import { ReservationsModule } from '../reservations/reservations.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
    ]),
    ReservationsModule,
    HotelsModule, // ✅ Добавлено, чтобы HotelModel был доступен
  ],
  controllers: [HotelsAvailabilityController],
  providers: [HotelsAvailabilityService],
  exports: [HotelsAvailabilityService],
})
export class HotelRoomsModule {}