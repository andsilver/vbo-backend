import { Module } from '@nestjs/common';
import { TypeOrmModule as OrmModule } from '@nestjs/typeorm';

import { Entities, Modules } from './';
import { ConfigService } from '../core/services/config.service';

@Module({
  imports: [
    OrmModule.forRoot({
      entities: Entities,
      synchronize: true,
      ...ConfigService.databaseConfig
      // migrations,
      // migrationsRun: true,
    }),
    ...Modules
  ],
  exports: [...Modules]
})
export class TypeOrmModule {}
