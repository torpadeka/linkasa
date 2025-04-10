import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService],
  imports: [TypeOrmModule.forFeature([Account])],
  exports: [AccountsService],
})
export class AccountsModule {}
