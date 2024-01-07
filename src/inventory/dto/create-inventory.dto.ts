import { IsNumber, IsPositive, IsInt } from 'class-validator';

export class CreateInventoryDto {
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @IsInt({ message: 'Quantity must be an integer' })
  @IsPositive({ message: 'Quantity must be a positive number' })
  quantity: number;

  @IsNumber({}, { message: 'Expiry must be a valid number' })
  @IsInt({ message: 'Expiry must be an integer' })
  @IsPositive({ message: 'Expiry must be a positive number' })
  expiry: number;
}
