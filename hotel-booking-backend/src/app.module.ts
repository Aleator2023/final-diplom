import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { HotelsAvailabilityController } from './hotel-rooms/hotelsAvailability.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HotelsModule } from './hotels/hotels.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SupportChatModule } from './support-chat/support-chat.module';
import { HotelRoomsModule } from './hotel-rooms/hotel-rooms.module';
import { HotelsAvailabilityService } from './hotel-rooms/hotels-availability.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongo:27017/hotel-booking'),
    ReservationsModule,
    HotelsModule,
    HotelRoomsModule,
    UsersModule,
    AuthModule,
    SupportChatModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    HotelsAvailabilityController,
  ],
  providers: [AppService, HotelsAvailabilityService ],
})
export class AppModule {}
