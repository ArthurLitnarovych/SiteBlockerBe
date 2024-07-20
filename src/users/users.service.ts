import { Injectable } from '@nestjs/common';
import { AccountService } from 'src/account/account.service';
import { BlockListService } from 'src/block-list/block-list.service';
import { DbService } from 'src/db/db.service';

@Injectable()
export class UsersService {
  constructor(
    private dbService: DbService,
    private accountService: AccountService,
    private blockListService: BlockListService,
  ) {}

  findByEmail(email: string) {
    return this.dbService.user.findFirst({ where: { email } });
  }

  async create(email: string, hash: string, salt: string) {
    const transaction = await this.dbService.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: { email, hash, salt },
      });
      await this.accountService.createAccount(prisma, user.id);
      await this.blockListService.create(prisma, user.id);
      return user;
    });
    return transaction;
  }
}
