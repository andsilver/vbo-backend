import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { TypeOrmModule } from './typeorm/typeorm.module';
import { UsersController } from './controllers/users/users.controller';
import { OrganizationsController } from './controllers/organizations/organizations.controller';
import { AuthenticationController } from './controllers/authentication/authentication.controller';
import { VeeamController } from './controllers/veeam/veeam.controller';

@Module({
  imports: [TypeOrmModule, CoreModule],
  controllers: [
    AppController,
    AuthenticationController,
    UsersController,
    OrganizationsController,
    VeeamController
  ],
  providers: [AppService]
})
export class AppModule {}
