import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from './entities/assignment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = this.assignmentRepository.create(createAssignmentDto);
    return this.assignmentRepository.save(assignment);
  }

  async findAll(): Promise<Assignment[]> {
    return this.assignmentRepository.find();
  }

  async findOne(id: number): Promise<Assignment | null> {
    return this.assignmentRepository.findOneBy({ id });
  }

  async findByCourseId(courseId: number) {
    const assignments = await this.assignmentRepository.find({
      where: { courseId },
    });
    if (!assignments) {
      throw new NotFoundException(
        `No assignments found for course ID ${courseId}`,
      );
    }
    return assignments;
  }

  async update(
    id: number,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment | null> {
    await this.assignmentRepository.update(id, updateAssignmentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.assignmentRepository.delete(id);
  }
}
