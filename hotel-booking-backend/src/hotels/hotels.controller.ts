import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Param, 
  Query, 
  Body, 
  NotFoundException, 
  UseInterceptors, 
  UploadedFiles, 
  UseGuards 
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { Hotel } from '../schemas/hotel.schema';
import { HotelRoom } from '../schemas/hotel-room.schema';
import { Types } from 'mongoose';
import { 
  SearchHotelParams, 
  UpdateHotelParams, 
  SearchRoomsParams, 
  UpdateHotelRoomParams 
} from './hotel-interfaces';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../auth/roles.guard'; 
import { Roles } from '../auth/roles.decorator';


@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  // Создание новой гостиницы (доступно только администратору)
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
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

  // Обновление данных гостиницы (доступно только администратору)
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateHotel(@Param('id') id: string, @Body() data: UpdateHotelParams): Promise<Hotel> {
    return this.hotelsService.update(id, data);
  }

  // Создание нового номера в гостинице (доступно только администратору)
  @Post(':hotelId/rooms')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createRoom(@Param('hotelId') hotelId: string, @Body() data: Partial<HotelRoom>): Promise<HotelRoom> {
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
    return this.hotelsService.searchRooms({ ...params, hotel: new Types.ObjectId(hotelId) });
  }

  // Обновление данных номера (доступно только администратору)
  @Put('rooms/:roomId')
@UseGuards(RolesGuard)
@Roles('admin')
@UseInterceptors(FilesInterceptor('images'))
async updateRoom(
  @Param('roomId') roomId: string,
  @Body() data: UpdateHotelRoomParams,
  @UploadedFiles() files: Array<{ path: string }>, // простой тип объекта для файлов
): Promise<HotelRoom> {
  const images = files.map(file => file.path);
  const updatedData = { ...data, images: [...(data.images || []), ...images] };
  return this.hotelsService.updateRoom(roomId, updatedData);
}
}