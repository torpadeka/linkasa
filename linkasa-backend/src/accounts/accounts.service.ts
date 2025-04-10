import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly courseRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const course = this.courseRepository.create(createAccountDto);
    return this.courseRepository.save(course);
  }

  async findAll(): Promise<Account[]> {
    return this.courseRepository.find();
  }

  async findOne(email: string, password: string): Promise<Account | null> {
    return this.courseRepository.findOne({
      where: { email: email, password: password },
    });
  }

  async findOneById(id: number): Promise<Account | null> {
    return this.courseRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account | null> {
    await this.courseRepository.update(id, updateAccountDto);
    return this.findOneById(id);
  }

  async remove(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }
}
