import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoursesModule } from './courses/courses.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AccountsModule } from './accounts/accounts.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      // host: 'localhost',
      host: 'mysql-service',
      // port: 3306,
      username: 'torpadeka',
      password: 'torpadeka',
      // username: 'root',
      // password: '',
      database: 'linkasa',
      entities: [],
      synchronize: true,
      autoLoadEntities: true,
    }),
    CoursesModule,
    AssignmentsModule,
    AccountsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
