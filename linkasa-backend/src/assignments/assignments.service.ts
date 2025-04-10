import { Injectable } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly courseRepository: Repository<Assignment>,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const course = this.courseRepository.create(createAssignmentDto);
    return this.courseRepository.save(course);
  }

  async findAll(): Promise<Assignment[]> {
    return this.courseRepository.find();
  }

  async findOne(id: number): Promise<Assignment | null> {
    return this.courseRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment | null> {
    await this.courseRepository.update(id, updateAssignmentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }
}
