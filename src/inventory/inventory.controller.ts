import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { SellInventoryDto } from './dto/sell-inventory.dto';

@Controller(':item')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('add')
  async createInventory(
    @Param('item') item: string,
    @Body() { quantity, expiry }: CreateInventoryDto,
  ) {
    return this.inventoryService.createInventory({ item, quantity, expiry });
  }

  @Post('sell')
  async sellInventory(
    @Param('item') item: string,
    @Body() { quantity }: SellInventoryDto,
  ) {
    return this.inventoryService.sellInventory({ item, quantity });
  }

  @Get('quantity')
  async getQuantity(@Param('item') item: string) {
    return this.inventoryService.getQuantity(item);
  }
}
