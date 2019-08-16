import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { TypeOrmModule } from './typeorm/typeorm.module';
import { UsersController } from './controllers/users/users.controller';
import { OrganizationsController } from './controllers/organizations/organizations.controller';
import { AuthenticationController } from './controllers/authentication/authentication.controller';

@Module({
  imports: [TypeOrmModule, CoreModule],
  controllers: [
    AppController,
    AuthenticationController,
    UsersController,
    OrganizationsController
  ],
  providers: [AppService]
})
export class AppModule {}
