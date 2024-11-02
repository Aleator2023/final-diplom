import { Controller, Get, Post, Put, Param, Query, Body, NotFoundException } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { Hotel } from '../schemas/hotel.schema';
import { HotelRoom } from '../schemas/hotel-room.schema';
import { Types } from 'mongoose'; 
import { SearchHotelParams, UpdateHotelParams, SearchRoomsParams, UpdateHotelRoomParams } from './hotel-interfaces';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  // Создание новой гостиницы
  @Post()
  async createHotel(@Body() data: Partial<Hotel>): Promise<Hotel> {
    return this.hotelsService.createHotel(data);
  }

  // Поиск гостиницы по ID
  @Get(':id')
  async findHotelById(@Param('id') id: string): Promise<Hotel> {
    const hotel = await this.hotelsService.findById(id);
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }
    return hotel;
  }

  // Поиск гостиниц с фильтрацией
  @Get()
  async searchHotels(@Query() params: SearchHotelParams): Promise<Hotel[]> {
    return this.hotelsService.search(params);
  }

  // Обновление данных гостиницы
  @Put(':id')
  async updateHotel(@Param('id') id: string, @Body() data: UpdateHotelParams): Promise<Hotel> {
    return this.hotelsService.update(id, data);
  }

  // Создание нового номера в гостинице
  @Post(':hotelId/rooms')
  async createRoom(@Param('hotelId') hotelId: string, @Body() data: Partial<HotelRoom>): Promise<HotelRoom> {
    // Преобразуем hotelId в ObjectId
    const roomData = { ...data, hotel: new Types.ObjectId(hotelId) };
    return this.hotelsService.createRoom(roomData);
  }

  // Поиск номера по ID
  @Get('rooms/:roomId')
  async findRoomById(@Param('roomId') roomId: string): Promise<HotelRoom> {
    const room = await this.hotelsService.findRoomById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  // Поиск номеров с фильтрацией
  @Get(':hotelId/rooms')
  async searchRooms(
    @Param('hotelId') hotelId: string,
    @Query() params: Omit<SearchRoomsParams, 'hotel'>,
  ): Promise<HotelRoom[]> {
    // Преобразуем hotelId в ObjectId и добавляем к параметрам
    return this.hotelsService.searchRooms({ ...params, hotel: new Types.ObjectId(hotelId) });
  }

  // Обновление данных номера
  @Put('rooms/:roomId')
  async updateRoom(@Param('roomId') roomId: string, @Body() data: UpdateHotelRoomParams): Promise<HotelRoom> {
    return this.hotelsService.updateRoom(roomId, data);
  }
}