import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hotel } from '../schemas/hotel.schema';
import { HotelRoom } from '../schemas/hotel-room.schema';
import {
  IHotelService,
  IHotelRoomService,
  SearchHotelParams,
  UpdateHotelParams,
  SearchRoomsParams,
  UpdateHotelRoomParams,
} from './hotel-interfaces';

@Injectable()
export class HotelsService implements IHotelService, IHotelRoomService {
  constructor(
    @InjectModel(Hotel.name) private hotelModel: Model<Hotel>,
    @InjectModel(HotelRoom.name) private hotelRoomModel: Model<HotelRoom>,
  ) {}

  async createHotel(data: Partial<Hotel>): Promise<Hotel> {
    try {
      const newHotel = new this.hotelModel(data);
      return await newHotel.save();
    } catch (error) {
      console.error("Error creating hotel:", error);
      throw new InternalServerErrorException('Error creating hotel');
    }
  }

  async findById(id: string): Promise<Hotel> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid hotel ID');
    }

    const hotel = await this.hotelModel.findById(new Types.ObjectId(id)).exec();
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }
    return hotel;
  }

  async search(params: SearchHotelParams): Promise<Hotel[]> {
    try {
      const query = this.hotelModel.find();

      if (params.title) {
        query.where('title').regex(new RegExp(params.title, 'i'));
      }

      query.skip(params.offset).limit(params.limit);
      return query.exec();
    } catch (error) {
      throw new InternalServerErrorException('Error searching hotels');
    }
  }

  async update(id: string, data: UpdateHotelParams): Promise<Hotel> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid hotel ID');
    }

    const updatedHotel = await this.hotelModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updatedHotel) {
      throw new NotFoundException('Hotel not found');
    }
    return updatedHotel;
  }

  async createRoom(data: Partial<HotelRoom>): Promise<HotelRoom> {
    try {
      const newRoom = new this.hotelRoomModel(data);
      return await newRoom.save();
    } catch (error) {
      console.error("Error creating room:", error);
      throw new InternalServerErrorException('Error creating hotel room');
    }
  }

  async findRoomById(id: string): Promise<HotelRoom> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid room ID');
    }

    const room = await this.hotelRoomModel.findById(new Types.ObjectId(id)).exec();
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async searchRooms(params: SearchRoomsParams): Promise<HotelRoom[]> {
    try {
      const query = this.hotelRoomModel.find();

      if (params.hotel) {
        query.where('hotel').equals(params.hotel);
      }
      if (params.isEnabled !== undefined) {
        query.where('isEnabled').equals(params.isEnabled);
      }

      query.skip(params.offset).limit(params.limit);
      return query.exec();
    } catch (error) {
      throw new InternalServerErrorException('Error searching rooms');
    }
  }

  async updateRoom(id: string, data: UpdateHotelRoomParams): Promise<HotelRoom> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid room ID');
    }

    const updatedRoom = await this.hotelRoomModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updatedRoom) {
      throw new NotFoundException('Room not found');
    }
    return updatedRoom;
  }

  async deleteHotel(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid hotel ID');
    }

    const result = await this.hotelModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Hotel not found');
    }
  }
}