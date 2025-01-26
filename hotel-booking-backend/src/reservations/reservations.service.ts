import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation } from '../schemas/reservation.schema';
import { ReservationDto, ReservationSearchOptions, IReservation } from './reservation-interfaces';

@Injectable()
export class ReservationsService implements IReservation {
  constructor(@InjectModel(Reservation.name) private reservationModel: Model<Reservation>) {}

  // Метод для добавления нового бронирования
  async addReservation(data: ReservationDto): Promise<Reservation> {
    const { roomId, dateStart, dateEnd } = data;

    // Преобразуем даты в миллисекунды
    const start = new Date(dateStart).getTime();
    const end = new Date(dateEnd).getTime();

    // Проверка на занятость номера на указанные даты
    const conflictingReservation = await this.reservationModel.findOne({
      roomId,
      dateStart: { $lt: end },
      dateEnd: { $gt: start },
    });

    if (conflictingReservation) {
      throw new ConflictException('The room is already booked for the selected dates');
    }

    return this.reservationModel.create(data); // Изменено создание бронирования
  }

  // Метод для удаления бронирования по ID
  async removeReservation(id: string): Promise<void> {
    const result = await this.reservationModel.findByIdAndDelete(id); 
    if (!result) {
      throw new NotFoundException('Reservation not found');
    }
  }

  // Метод для получения бронирований с фильтрацией по параметрам
  async getReservations(filter?: ReservationSearchOptions): Promise<Array<Reservation>> {
    const query = this.reservationModel.find();
    
    if (filter?.userId) {
        query.where('userId').equals(filter.userId);
    }
    if (filter?.dateStart) {
        query.where('dateEnd').gte(new Date(filter.dateStart).getTime());
    }
    if (filter?.dateEnd) {
        query.where('dateStart').lte(new Date(filter.dateEnd).getTime());
    }

    return query.exec();
}
}