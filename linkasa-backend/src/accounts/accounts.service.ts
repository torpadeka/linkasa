import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountRepository.create(createAccountDto);
    return this.accountRepository.save(account);
  }

  async findAll(): Promise<Account[]> {
    return this.accountRepository.find();
  }

  async findOne(email: string): Promise<Account | null> {
    return this.accountRepository.findOne({
      where: { email: email },
    });
  }

  async findOneById(id: number) {
    console.log(`Fetching account with ID: ${id}`); // Debug log
    const account = await this.accountRepository.findOneBy({ id });
    console.log(`Account found: ${JSON.stringify(account)}`); // Debug log
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      password: account.password,
      role: account.role,
    }; // Explicitly return fields, excluding password
  }
  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account | null> {
    await this.accountRepository.update(id, updateAccountDto);
    return this.findOneById(id);
  }

  async remove(id: number): Promise<void> {
    await this.accountRepository.delete(id);
  }
}
