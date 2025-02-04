import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HotelRoom } from '../schemas/hotel-room.schema';
import { Hotel } from '../schemas/hotel.schema';
import { CreateHotelRoomDto, UpdateHotelRoomDto } from '../dto/hotel-room.dto';

@Injectable()
export class HotelRoomsService {
  constructor(
    @InjectModel(HotelRoom.name) private hotelRoomModel: Model<HotelRoom>,
    @InjectModel(Hotel.name) private hotelModel: Model<Hotel>,
  ) {}

  async create(createHotelRoomDto: CreateHotelRoomDto): Promise<HotelRoom> {
    const { hotelId, description, images } = createHotelRoomDto;

    const hotel = await this.hotelModel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundException('Гостиница не найдена');
    }

    const newRoom = new this.hotelRoomModel({
      hotel: new Types.ObjectId(hotelId),
      description,
      images,
    });

    return newRoom.save();
  }

  async update(
    id: string,
    updateHotelRoomDto: UpdateHotelRoomDto,
    newImages: string[],
  ): Promise<HotelRoom> {
    const existingRoom = await this.hotelRoomModel.findById(id);
    if (!existingRoom) {
      throw new NotFoundException('Номер не найден');
    }

    const updatedImages = [...(updateHotelRoomDto.images || []), ...newImages];

    return this.hotelRoomModel.findByIdAndUpdate(
      id,
      { ...updateHotelRoomDto, images: updatedImages },
      { new: true },
    );
  }
}