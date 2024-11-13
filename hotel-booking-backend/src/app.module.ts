import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HotelsModule } from './hotels/hotels.module';
import { ReservationsModule } from './reservations/reservations.module'; 
import { SupportChatModule } from './support-chat/support-chat.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongo:27017/hotel-booking'), 
    UsersModule,
    AuthModule,
    HotelsModule,
    ReservationsModule, 
    SupportChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}