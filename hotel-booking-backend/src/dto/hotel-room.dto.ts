import { IsString, IsBoolean, IsArray, IsMongoId, IsOptional } from 'class-validator';

export class CreateHotelRoomDto {
  @IsMongoId()
  hotelId: string;

  @IsString()
  description: string;

  @IsArray()
  @IsOptional()
  images?: string[];
}

export class UpdateHotelRoomDto {
  @IsString()
  description: string;

  @IsBoolean()
  isEnabled: boolean;

  @IsArray()
  @IsOptional()
  images?: string[];
}