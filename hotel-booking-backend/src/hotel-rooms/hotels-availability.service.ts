import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hotel } from '../schemas/hotel.schema';
import { Reservation } from '../schemas/reservation.schema';
import { SearchHotelParams } from '../hotels/hotel-interfaces';

@Injectable()
export class HotelsAvailabilityService {
  constructor(
    @InjectModel(Hotel.name) private hotelModel: Model<Hotel>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
  ) {}

  async getAvailableHotels(params: SearchHotelParams): Promise<Hotel[]> {
    try {
      const hotels = await this.hotelModel.find().populate('rooms').exec(); // Подгружаем информацию о номерах

      if (params.checkIn && params.checkOut) {
        const bookedRooms = await this.reservationModel
          .find({
            dateStart: { $lte: params.checkOut },
            dateEnd: { $gte: params.checkIn },
          })
          .exec();

        const bookedRoomIds = new Set(
          bookedRooms.map((reservation) => reservation.roomId),
        );

        return hotels.filter((hotel) => {
          return hotel.rooms.some((room) => !bookedRoomIds.has(room._id)); // Проверяем, есть ли свободные номера
        });
      }

      return hotels; // Если даты не указаны, возвращаем все отели
    } catch (error) {
      console.error('Error in getAvailableHotels:', error);
      throw new InternalServerErrorException(
        'Ошибка при получении доступных отелей',
      );
    }
  }
}
