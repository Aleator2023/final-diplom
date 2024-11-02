import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  // Метод для создания гостиницы
  async createHotel(data: Partial<Hotel>): Promise<Hotel> {
    return this.hotelModel.create(data); 
  }

  // Метод для поиска гостиницы по ID
  async findById(id: string): Promise<Hotel> {
    const hotel = await this.hotelModel.findById(id).exec();
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }
    return hotel;
  }

  // Метод для поиска гостиниц с фильтрацией
  async search(params: SearchHotelParams): Promise<Hotel[]> {
    const query = this.hotelModel.find();

    if (params.title) {
      query.where('title').regex(new RegExp(params.title, 'i'));
    }

    query.skip(params.offset).limit(params.limit);
    return query.exec();
  }

  // Метод для обновления данных гостиницы
  async update(id: string, data: UpdateHotelParams): Promise<Hotel> {
    const updatedHotel = await this.hotelModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updatedHotel) {
      throw new NotFoundException('Hotel not found');
    }
    return updatedHotel;
  }

  // Метод для создания номера в гостинице
  async createRoom(data: Partial<HotelRoom>): Promise<HotelRoom> {
    return this.hotelRoomModel.create(data); 
  }

  // Метод для поиска номера по ID
  async findRoomById(id: string): Promise<HotelRoom> {
    const room = await this.hotelRoomModel.findById(id).exec();
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  // Метод для поиска номеров с фильтрацией
  async searchRooms(params: SearchRoomsParams): Promise<HotelRoom[]> {
    const query = this.hotelRoomModel.find();

    if (params.hotel) {
      query.where('hotel').equals(params.hotel);
    }
    if (params.isEnabled !== undefined) {
      query.where('isEnabled').equals(params.isEnabled);
    }

    query.skip(params.offset).limit(params.limit);
    return query.exec();
  }

  // Метод для обновления данных номера
  async updateRoom(id: string, data: UpdateHotelRoomParams): Promise<HotelRoom> {
    const updatedRoom = await this.hotelRoomModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updatedRoom) {
      throw new NotFoundException('Room not found');
    }
    return updatedRoom;
  }
}