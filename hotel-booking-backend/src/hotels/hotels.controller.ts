import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  NotFoundException,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { Hotel } from '../schemas/hotel.schema';
import { HotelRoom } from '../schemas/hotel-room.schema';
import { Types } from 'mongoose';
import {
  SearchHotelParams,
  UpdateHotelParams,
  SearchRoomsParams,
  UpdateHotelRoomParams,
} from './hotel-interfaces';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { multerOptions } from '../config/multer.config';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post()
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  async createHotel(
    @Body() data: Partial<Hotel>,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Hotel> {
    const images = files.map((file) => `uploads/hotels/${file.filename}`); // Добавляем путь к файлам
    return this.hotelsService.createHotel({ ...data, images });
  }

  @Get(':id')
  async findHotelById(@Param('id') id: string): Promise<Hotel> {
    const hotel = await this.hotelsService.findById(id);
    if (!hotel) {
      throw new NotFoundException('Гостиница не найдена');
    }

    return {
      ...hotel.toObject(),
      images: hotel.images
        .filter(
          (img) => typeof img === 'string' && img.startsWith('uploads/hotels/'),
        )
        .map((img) => `http://localhost:3000/${img}`),
    };
  }

  @Get()
  async getAllHotels(): Promise<Hotel[]> {
    const hotels = await this.hotelsService.getAll();
    return hotels.map((hotel) => ({
      ...hotel.toObject(),
      images: hotel.images
        .filter(
          (img) => typeof img === 'string' && img.startsWith('uploads/hotels/'),
        )
        .map((img) => `http://localhost:3000/${img}`),
    }));
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  async updateHotel(
    @Param('id') id: string,
    @Body() data: Partial<UpdateHotelParams>, // 👈 Делаем поля необязательными
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<Hotel> {
    const hotel = await this.hotelsService.findById(id);
    if (!hotel) {
      throw new NotFoundException('Гостиница не найдена');
    }

    let existingImages: string[] = hotel.images || [];

    try {
      if (data.existingImages) {
        if (typeof data.existingImages === 'string') {
          existingImages = JSON.parse(data.existingImages);
        } else if (Array.isArray(data.existingImages)) {
          existingImages = data.existingImages;
        }
      }

      if (!Array.isArray(existingImages)) {
        throw new Error('existingImages должен быть массивом строк');
      }
    } catch (error) {
      console.error('❌ Ошибка при обработке existingImages:', error);
      throw new InternalServerErrorException(
        'Ошибка при обработке существующих изображений',
      );
    }

    // ✅ Убираем `localhost:3000/` (если клиент всё-таки отправил ссылки с ним)
    existingImages = existingImages.map((img) =>
      img.replace('http://localhost:3000/', ''),
    );

    // ✅ Добавляем новые загруженные изображения
    const newImages = files.map((file) => `uploads/hotels/${file.filename}`);

    // ✅ Создаем финальный массив изображений (старые + новые)
    const updatedImages = [...existingImages, ...newImages];

    // ✅ Формируем обновленные данные (меняем только переданные поля)
    const updatedData: Partial<Hotel> = {};
    if (data.title) updatedData.title = data.title;
    if (data.description) updatedData.description = data.description;
    updatedData.images = updatedImages;

    return this.hotelsService.update(id, updatedData);
  }

  @Delete(':id')
  //@UseGuards(RolesGuard)
  // @Roles('admin')
  async deleteHotel(@Param('id') id: string) {
    await this.hotelsService.deleteHotel(id);
    return { message: 'Hotel deleted successfully' };
  }

  @Post(':hotelId/rooms')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createRoom(
    @Param('hotelId') hotelId: string,
    @Body() data: Partial<HotelRoom>,
  ): Promise<HotelRoom> {
    const roomData = { ...data, hotel: new Types.ObjectId(hotelId) };
    return this.hotelsService.createRoom(roomData);
  }

  @Get('rooms/:roomId')
  async findRoomById(@Param('roomId') roomId: string): Promise<HotelRoom> {
    return this.hotelsService.findRoomById(roomId);
  }

  @Get(':hotelId/rooms')
  async searchRooms(
    @Param('hotelId') hotelId: string,
    @Query() params: Omit<SearchRoomsParams, 'hotel'>,
  ): Promise<HotelRoom[]> {
    return this.hotelsService.searchRooms({
      ...params,
      hotel: new Types.ObjectId(hotelId),
    });
  }

  @Put('rooms/:roomId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(FilesInterceptor('images'))
  async updateRoom(
    @Param('roomId') roomId: string,
    @Body() data: UpdateHotelRoomParams,
    @UploadedFiles() files: Array<{ path: string }>,
  ): Promise<HotelRoom> {
    const images = files.map((file) => file.path);
    const updatedData = {
      ...data,
      images: [...(data.images || []), ...images],
    };
    return this.hotelsService.updateRoom(roomId, updatedData);
  }
}
