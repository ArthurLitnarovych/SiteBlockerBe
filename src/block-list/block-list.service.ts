import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { AddBlockItemDto, BlockListQueryDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BlockListService {
  constructor(private db: DbService) {}

  create(prisma: Prisma.TransactionClient, userId: number) {
    return prisma.blockList.create({ data: { ownerId: userId } });
  }

  getByUser(userId: number, query: BlockListQueryDto) {
    return this.db.blockList.findUniqueOrThrow({
      where: { ownerId: userId },
      include: {
        items: {
          where: { data: { contains: query.q, mode: 'insensitive' } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async addItem(userId: number, data: AddBlockItemDto) {
    const blockList = await this.db.blockList.findUniqueOrThrow({
      where: { ownerId: userId },
    });
    return this.db.blockItem.create({
      data: { blockListId: blockList.id, ...data },
    });
  }

  async removeItem(userId: number, itemId: number) {
    const blockList = await this.db.blockList.findUniqueOrThrow({
      where: { ownerId: userId },
    });

    return this.db.blockItem.delete({
      where: { blockListId: blockList.id, id: itemId },
    });
  }
}
