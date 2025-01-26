import { Test, TestingModule } from '@nestjs/testing';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { Types } from 'mongoose';

describe('HotelsController', () => {
  let controller: HotelsController;
  let service: HotelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelsController],
      providers: [
        {
          provide: HotelsService,
          useValue: {
            createHotel: jest.fn(),
            findById: jest.fn(),
            search: jest.fn(),
            createRoom: jest.fn(),
            findRoomById: jest.fn(),
            searchRooms: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HotelsController>(HotelsController);
    service = module.get<HotelsService>(HotelsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a hotel', async () => {
    const hotelData = { title: 'Test Hotel', description: 'Test Description' };
    const savedHotel = { ...hotelData, _id: new Types.ObjectId() } as any; // Используем 'as any' для mock-объекта
    jest.spyOn(service, 'createHotel').mockResolvedValue(savedHotel);

    const result = await controller.createHotel(hotelData);
    expect(result).toEqual(savedHotel);
  });

  it('should find a hotel by ID', async () => {
    const hotelId = new Types.ObjectId().toHexString();
    const hotel = { _id: new Types.ObjectId(hotelId), title: 'Test Hotel', description: 'Test Description' } as any; // Используем 'as any' для mock-объекта
    jest.spyOn(service, 'findById').mockResolvedValue(hotel);

    const result = await controller.findHotelById(hotelId);
    expect(result).toEqual(hotel);
  });

  it('should create a hotel room', async () => {
    const roomData = { hotel: new Types.ObjectId(), description: 'Room Description' };
    const savedRoom = { ...roomData, _id: new Types.ObjectId(), isEnabled: true } as any; // Используем 'as any' для mock-объекта
    jest.spyOn(service, 'createRoom').mockResolvedValue(savedRoom);

    const result = await controller.createRoom(roomData.hotel.toHexString(), roomData);
    expect(result).toEqual(savedRoom);
  });
});