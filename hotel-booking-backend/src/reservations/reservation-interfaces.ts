import { Types } from 'mongoose';
import { Reservation } from '../schemas/reservation.schema'; 

export type ID = string | Types.ObjectId;

export interface ReservationDto {
  userId: ID;
  hotelId: ID;
  roomId: ID;
  dateStart: Date;
  dateEnd: Date;
}

export interface ReservationSearchOptions {
  userId: ID;
  dateStart?: Date;
  dateEnd?: Date;
}

export interface IReservation {
  addReservation(data: ReservationDto): Promise<Reservation>;
  removeReservation(id: ID): Promise<void>;
  getReservations(filter: ReservationSearchOptions): Promise<Array<Reservation>>;
}