import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { HotelRoomsService } from '../hotel-rooms/hotel-rooms.service';
import { CreateHotelRoomDto, UpdateHotelRoomDto } from '../dto/hotel-room.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { multerOptions } from '../config/multer.config';

@Controller('api/admin/hotel-rooms')
//@UseGuards(RolesGuard)
//@Roles('admin')
export class HotelRoomsController {
  constructor(private readonly hotelRoomsService: HotelRoomsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  async createHotelRoom(
    @Body() createHotelRoomDto: CreateHotelRoomDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const images = files.map((file) => `uploads/hotels/${file.filename}`);
    return this.hotelRoomsService.create({ ...createHotelRoomDto, images });
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  async updateHotelRoom(
    @Param('id') id: string,
    @Body() updateHotelRoomDto: UpdateHotelRoomDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const newImages = files.map((file) => `uploads/hotels/${file.filename}`);
    return this.hotelRoomsService.update(id, updateHotelRoomDto, newImages);
  }

  @Delete(':id')
  async deleteHotelRoom(@Param('id') id: string) {
    try {
      await this.hotelRoomsService.delete(id);

      return { message: 'Hotel-room deleted successfully' };
    } catch (error) {
      throw new NotFoundException('Hotel-room not found', error);
    }
  }
}
