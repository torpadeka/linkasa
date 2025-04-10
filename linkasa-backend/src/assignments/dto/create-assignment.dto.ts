import { IsString, IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAssignmentDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  courseId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  isFinished: boolean;
}
