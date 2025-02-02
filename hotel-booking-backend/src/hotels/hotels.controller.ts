import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
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

  @Post()
  // @UseGuards(RolesGuard)
  // @Roles('admin')
  async createHotel(@Body() data: Partial<Hotel>): Promise<Hotel> {
    return this.hotelsService.createHotel(data);
  }

  @Get(':id')
  async findHotelById(@Param('id') id: string): Promise<Hotel> {
    return this.hotelsService.findById(id);
  }

  @Get()
  async searchHotels(@Query() params: SearchHotelParams): Promise<Hotel[]> {
    return this.hotelsService.search(params);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateHotel(@Param('id') id: string, @Body() data: UpdateHotelParams): Promise<Hotel> {
    return this.hotelsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  // @Roles('admin')
  async deleteHotel(@Param('id') id: string) {
    await this.hotelsService.deleteHotel(id);
    return { message: 'Hotel deleted successfully' };
  }

  @Post(':hotelId/rooms')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async createRoom(@Param('hotelId') hotelId: string, @Body() data: Partial<HotelRoom>): Promise<HotelRoom> {
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
    return this.hotelsService.searchRooms({ ...params, hotel: new Types.ObjectId(hotelId) });
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
    const images = files.map(file => file.path);
    const updatedData = { ...data, images: [...(data.images || []), ...images] };
    return this.hotelsService.updateRoom(roomId, updatedData);
  }
}