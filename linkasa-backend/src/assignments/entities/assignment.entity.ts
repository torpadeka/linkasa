import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  courseId: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: false })
  isFinished: boolean;
}
