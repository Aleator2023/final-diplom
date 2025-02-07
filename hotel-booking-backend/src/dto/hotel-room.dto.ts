import {
  IsString,
  IsBoolean,
  IsArray,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class CreateHotelRoomDto {
  @IsMongoId()
  hotelId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsOptional()
  images?: string[];
}

export class UpdateHotelRoomDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  isEnabled?: boolean | string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  existingImages?: string[];
}
