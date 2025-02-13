import { Controller, Get, Query } from '@nestjs/common';
import { HotelsAvailabilityService } from './hotels-availability.service'; // Импорт нового сервиса
import { SearchHotelParams } from '../hotels/hotel-interfaces';
import { Hotel } from '../schemas/hotel.schema';

@Controller('available-hotels') // Новый маршрут
export class HotelsAvailabilityController {
  constructor(
    private readonly hotelsAvailabilityService: HotelsAvailabilityService,
  ) {}

  @Get()
  async getAvailableHotels(
    @Query() params: SearchHotelParams,
  ): Promise<Hotel[]> {
    return this.hotelsAvailabilityService.getAvailableHotels(params);
  }
}
