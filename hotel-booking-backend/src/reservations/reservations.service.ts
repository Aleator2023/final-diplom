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
    const { roomId, dateStart, dateEnd, hotelId, userId } = data;
  
    console.log("📥 Данные для бронирования:", { hotelId, roomId, userId, dateStart, dateEnd });
  
    const start = new Date(dateStart).getTime();
    const end = new Date(dateEnd).getTime();
  
    // Проверяем, нет ли пересекающихся бронирований
    const conflictingReservation = await this.reservationModel.findOne({
      room: new Types.ObjectId(roomId), // ✅ Убедимся, что roomId - ObjectId
      $or: [
        { dateStart: { $lt: end, $gte: start } },
        { dateEnd: { $gt: start, $lte: end } },
        { dateStart: { $lte: start }, dateEnd: { $gte: end } },
      ],
    });
  
    if (conflictingReservation) {
      throw new ConflictException('Этот номер уже забронирован на указанные даты');
    }
  
    try {
      const newReservation = await this.reservationModel.create({
        hotel: new Types.ObjectId(hotelId), // ✅ Приводим hotelId к ObjectId
        room: new Types.ObjectId(roomId), // ✅ Приводим roomId к ObjectId
        userId: new Types.ObjectId(userId), // ✅ Приводим userId к ObjectId
        dateStart,
        dateEnd,
      });
  
      console.log("✅ Бронирование успешно создано:", newReservation);
      return newReservation;
    } catch (error) {
      console.error("❌ Ошибка при создании бронирования:", error);
      throw new NotFoundException("Ошибка при создании бронирования");
    }
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
    try {
      const query = this.reservationModel.find();
  
      if (filter?.userId) {
        if (!Types.ObjectId.isValid(filter.userId)) {
          throw new NotFoundException('Некорректный userId');
        }
        query.where('userId').equals(new Types.ObjectId(filter.userId)); // ✅ Проверяем валидность ID
      }
  
      if (filter?.dateStart) {
        query.where('dateEnd').gte(new Date(filter.dateStart).getTime());
      }
      if (filter?.dateEnd) {
        query.where('dateStart').lte(new Date(filter.dateEnd).getTime());
      }
  
      return await query.populate('hotel').populate('room').exec(); // ✅ Теперь populate('hotel') работает
    } catch (error) {
      console.error('Ошибка при получении бронирований:', error);
      throw new NotFoundException('Ошибка при загрузке бронирований');
    }
  }
}