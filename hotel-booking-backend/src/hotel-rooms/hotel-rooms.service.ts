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
    const { hotelId, description, images, title } = createHotelRoomDto;

    const hotel = await this.hotelModel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundException('Гостиница не найдена');
    }

    const newRoom = new this.hotelRoomModel({
      hotel: new Types.ObjectId(hotelId),
      title,
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

    let existingImagesArray: string[] = [];
    if (typeof updateHotelRoomDto.existingImages === 'string') {
      try {
        existingImagesArray = JSON.parse(updateHotelRoomDto.existingImages);
      } catch (error) {
        console.error('Ошибка парсинга existingImages:', error);
        existingImagesArray = [];
        return existingRoom;
      }
    } else if (Array.isArray(updateHotelRoomDto.existingImages)) {
      existingImagesArray = updateHotelRoomDto.existingImages;
    } else {
      console.warn(
        'existingImages имеет неожиданный тип:',
        typeof updateHotelRoomDto.existingImages,
      );
      existingImagesArray = [];
    }

    const updatedImages = [...existingImagesArray, ...newImages];
    const isEnabled = updateHotelRoomDto.isEnabled === 'true';

    return this.hotelRoomModel.findByIdAndUpdate(
      id,
      {
        ...updateHotelRoomDto,
        images: updatedImages,
        isEnabled: isEnabled,
      },
      { new: true },
    );
  }

  async delete(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid hotel-room ID');
      }

      const result = await this.hotelRoomModel.deleteOne({ _id: id }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException('Hotel-room not found');
      }
    } catch (error) {
      throw new Error(`Ошибка при удалении номера: ${error.message}`);
    }
  }
}
