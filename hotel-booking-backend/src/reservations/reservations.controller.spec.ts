import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ReservationDto } from './reservation-interfaces';

const mockReservation = {
  _id: new Types.ObjectId(),
  userId: new Types.ObjectId(),
  hotelId: new Types.ObjectId(),
  roomId: new Types.ObjectId(),
  dateStart: new Date('2024-11-05'),
  dateEnd: new Date('2024-11-10'),
};

const mockReservationsService = {
  addReservation: jest.fn(),
  removeReservation: jest.fn(),
  getReservations: jest.fn(),
};

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [{ provide: ReservationsService, useValue: mockReservationsService }],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add a reservation successfully', async () => {
    const reservationDto: ReservationDto = {
      userId: mockReservation.userId,
      hotelId: mockReservation.hotelId,
      roomId: mockReservation.roomId,
      dateStart: mockReservation.dateStart,
      dateEnd: mockReservation.dateEnd,
    };

    mockReservationsService.addReservation.mockResolvedValue(mockReservation);

    const result = await controller.addReservation(reservationDto);

    expect(result).toEqual(mockReservation);
    expect(service.addReservation).toHaveBeenCalledWith(reservationDto);
  });

  it('should throw ConflictException if room is already booked', async () => {
    const reservationDto: ReservationDto = {
      userId: mockReservation.userId,
      hotelId: mockReservation.hotelId,
      roomId: mockReservation.roomId,
      dateStart: mockReservation.dateStart,
      dateEnd: mockReservation.dateEnd,
    };

    mockReservationsService.addReservation.mockRejectedValue(new ConflictException());

    await expect(controller.addReservation(reservationDto)).rejects.toThrow(ConflictException);
  });

  it('should delete a reservation successfully', async () => {
    mockReservationsService.removeReservation.mockResolvedValue(undefined);

    const result = await controller.removeReservation(mockReservation._id.toString());

    expect(result).toBeUndefined();
    expect(service.removeReservation).toHaveBeenCalledWith(mockReservation._id.toString());
  });

  it('should throw NotFoundException if reservation to delete does not exist', async () => {
    mockReservationsService.removeReservation.mockRejectedValue(new NotFoundException());

    await expect(controller.removeReservation(mockReservation._id.toString())).rejects.toThrow(NotFoundException);
  });

  it('should return reservations based on filter criteria', async () => {
    const filter = {
      userId: mockReservation.userId.toString(),
      dateStart: new Date('2024-11-01'),
      dateEnd: new Date('2024-11-15'),
    };

    mockReservationsService.getReservations.mockResolvedValue([mockReservation]);

    const result = await controller.getReservations(filter);

    expect(result).toEqual([mockReservation]);
    expect(service.getReservations).toHaveBeenCalledWith(filter);
  });
});