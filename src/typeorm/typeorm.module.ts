import { Module } from '@nestjs/common';
import { TypeOrmModule as OrmModule } from '@nestjs/typeorm';

import { Entities, Modules } from './';


@Module({
  imports: [
    OrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Gkscjd1121',
      database: 'vbo',
      entities: Entities,
      synchronize: true
      // migrations,
      // migrationsRun: true,
    }),
    ...Modules
  ],
  exports: [
    ...Modules
  ]
})
export class TypeOrmModule {}
