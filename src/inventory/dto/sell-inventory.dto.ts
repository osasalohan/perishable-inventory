import { IsNumber, IsPositive, IsInt } from 'class-validator';

export class SellInventoryDto {
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @IsInt({ message: 'Quantity must be an integer' })
  @IsPositive({ message: 'Quantity must be a positive number' })
  quantity: number;
}
