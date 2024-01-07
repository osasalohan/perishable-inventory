import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async createInventory(data: {
    item: string;
    quantity: number;
    expiry: number;
  }) {
    const inventory = this.inventoryRepository.create(data);
    await this.inventoryRepository.save(inventory);

    return 'Inventory created!';
  }

  async sellInventory({ item, quantity }: { item: string; quantity: number }) {
    const { quantity: totalQuantity } = await this.getQuantity(item);

    if (totalQuantity < quantity)
      throw new HttpException('Insufficient inventory!', HttpStatus.FORBIDDEN);

    await this.deductInventory({
      item,
      quantity,
      expiry: new Date().getTime(),
    });

    return 'Inventory sold!';
  }

  async getQuantity(
    item: string,
  ): Promise<{ quantity: number; validTill: number | null }> {
    const now = new Date().getTime();

    const result = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.quantity)', 'quantity')
      .addSelect('MIN(inventory.expiry)', 'validTill')
      .where('inventory.item = :item', { item })
      .andWhere('inventory.expiry > :expiry', { expiry: now })
      .andWhere('inventory.quantity > :quantity', { quantity: 0 })
      .getRawOne();

    const quantity = result ? Number(result.quantity) : 0;
    const validTill = quantity ? Number(result.validTill) : null;

    return { quantity, validTill };
  }

  async deductInventory({
    item,
    quantity,
    expiry,
  }: {
    item: string;
    quantity: number;
    expiry: number;
  }) {
    if (quantity === 0) return;

    const inventory = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.item = :item', { item })
      .andWhere('inventory.quantity > :quantity', { quantity: 0 })
      .andWhere('inventory.expiry > :expiry', { expiry })
      .orderBy('inventory.expiry', 'ASC')
      .limit(1)
      .getOne();

    if (inventory.quantity > quantity) {
      inventory.quantity -= quantity;
      quantity = 0;
    } else {
      quantity -= inventory.quantity;
      inventory.quantity = 0;
    }
    await this.inventoryRepository.save(inventory);

    return this.deductInventory({ item, quantity, expiry });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanExpiredInventory() {
    await this.inventoryRepository
      .createQueryBuilder('inventory')
      .delete()
      .where('inventory.expiry < :now', { now: new Date().getTime() })
      .execute();

    return 'Expired inventory cleaned!';
  }
}
