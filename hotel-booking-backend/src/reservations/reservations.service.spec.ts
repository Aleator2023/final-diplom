import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { getModelToken } from '@nestjs/mongoose';
import { Reservation } from '../schemas/reservation.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

const mockReservation = {
  _id: new Types.ObjectId(),
  userId: new Types.ObjectId(),
  hotelId: new Types.ObjectId(),
  roomId: new Types.ObjectId(),
  dateStart: new Date('2024-11-05'),
  dateEnd: new Date('2024-11-10'),
};

const mockReservationModel = {
  create: jest.fn().mockResolvedValue(mockReservation),
  findByIdAndDelete: jest.fn().mockResolvedValue(mockReservation),
  findOne: jest.fn(),
  find: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  equals: jest.fn().mockReturnThis(), // Добавляем equals
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([mockReservation]),
};

describe('ReservationsService', () => {
  let service: ReservationsService;
  let model: Model<Reservation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getModelToken(Reservation.name), useValue: mockReservationModel },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    model = module.get<Model<Reservation>>(getModelToken(Reservation.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a reservation successfully', async () => {
    mockReservationModel.findOne.mockResolvedValue(null);

    const result = await service.addReservation({
      userId: mockReservation.userId,
      hotelId: mockReservation.hotelId,
      roomId: mockReservation.roomId,
      dateStart: mockReservation.dateStart,
      dateEnd: mockReservation.dateEnd,
    });

    expect(result).toEqual(mockReservation);
    expect(mockReservationModel.create).toHaveBeenCalledWith({
      userId: mockReservation.userId,
      hotelId: mockReservation.hotelId,
      roomId: mockReservation.roomId,
      dateStart: mockReservation.dateStart,
      dateEnd: mockReservation.dateEnd,
    });
  });

  it('should throw ConflictException if room is already booked for the selected dates', async () => {
    mockReservationModel.findOne.mockResolvedValue(mockReservation);

    await expect(
      service.addReservation({
        userId: mockReservation.userId,
        hotelId: mockReservation.hotelId,
        roomId: mockReservation.roomId,
        dateStart: mockReservation.dateStart,
        dateEnd: mockReservation.dateEnd,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should delete a reservation successfully', async () => {
    const result = await service.removeReservation(mockReservation._id.toString());

    expect(result).toBeUndefined();
    expect(mockReservationModel.findByIdAndDelete).toHaveBeenCalledWith(mockReservation._id.toString());
  });

  it('should throw NotFoundException if reservation to delete does not exist', async () => {
    mockReservationModel.findByIdAndDelete.mockResolvedValue(null);

    await expect(service.removeReservation(mockReservation._id.toString())).rejects.toThrow(NotFoundException);
  });

  it('should return reservations based on filter criteria', async () => {
    const filter = { userId: mockReservation.userId, dateStart: new Date('2024-11-01'), dateEnd: new Date('2024-11-15') };

    mockReservationModel.where.mockReturnThis();
    mockReservationModel.equals.mockReturnThis();
    mockReservationModel.gte.mockReturnThis();
    mockReservationModel.lte.mockReturnThis();
    mockReservationModel.exec.mockResolvedValue([mockReservation]);

    const result = await service.getReservations(filter);

    expect(result).toEqual([mockReservation]);
    expect(mockReservationModel.where).toHaveBeenCalledWith('userId');
    expect(mockReservationModel.equals).toHaveBeenCalledWith(filter.userId);
    expect(mockReservationModel.gte).toHaveBeenCalledWith(filter.dateStart.getTime());
    expect(mockReservationModel.lte).toHaveBeenCalledWith(filter.dateEnd.getTime());
  });
});