import { Test, TestingModule } from '@nestjs/testing';
import { HotelsService } from './hotels.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hotel } from '../schemas/hotel.schema';
import { HotelRoom } from '../schemas/hotel-room.schema';

describe('HotelsService', () => {
  let service: HotelsService;
  let hotelModel: Model<Hotel>;
  let hotelRoomModel: Model<HotelRoom>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelsService,
        {
          provide: getModelToken(Hotel.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getModelToken(HotelRoom.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HotelsService>(HotelsService);
    hotelModel = module.get<Model<Hotel>>(getModelToken(Hotel.name));
    hotelRoomModel = module.get<Model<HotelRoom>>(getModelToken(HotelRoom.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a hotel', async () => {
    const hotelData = { title: 'Test Hotel', description: 'Test Description' };
    const savedHotel = { ...hotelData, _id: new Types.ObjectId() } as any; // Используем 'as any'
    jest.spyOn(hotelModel, 'create').mockResolvedValue(savedHotel);

    const result = await service.createHotel(hotelData);
    expect(result).toEqual(savedHotel);
  });

  it('should find a hotel by ID', async () => {
    const hotelId = new Types.ObjectId().toHexString();
    const hotel = { _id: hotelId, title: 'Test Hotel', description: 'Test Description' } as any; // Используем 'as any'
    jest.spyOn(hotelModel, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValue(hotel),
    } as any);

    const result = await service.findById(hotelId);
    expect(result).toEqual(hotel);
  });

  it('should create a hotel room', async () => {
    const roomData = { hotel: new Types.ObjectId(), description: 'Room Description' };
    const savedRoom = { ...roomData, _id: new Types.ObjectId(), isEnabled: true } as any; // Используем 'as any'
    jest.spyOn(hotelRoomModel, 'create').mockResolvedValue(savedRoom);

    const result = await service.createRoom(roomData);
    expect(result).toEqual(savedRoom);
  });
});