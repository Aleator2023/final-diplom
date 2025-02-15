import { Controller, Get, Post, Delete, Param, Body, Query, NotFoundException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationDto, ReservationSearchOptions } from './reservation-interfaces';
import { Reservation } from '../schemas/reservation.schema';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // Создание нового бронирования
  @Post()
  async addReservation(@Body() data: ReservationDto): Promise<Reservation> {
    console.log("📥 Получены данные для бронирования:", data);
    return this.reservationsService.addReservation(data);
  }

  // Удаление бронирования по ID
  @Delete(':id')
  async removeReservation(@Param('id') id: string): Promise<void> {
    return this.reservationsService.removeReservation(id);
  }

  // Получение списка бронирований с фильтрацией
  @Get()
  async getReservations(@Query() filter: ReservationSearchOptions): Promise<Array<Reservation>> {
    console.log("🔍 Фильтр userId:", filter.userId); // Логируем userId, который пришел с фронта
    return this.reservationsService.getReservations(filter);
  }
}