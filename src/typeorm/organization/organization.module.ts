import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { Organization } from './organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Organization ])
  ],
  exports: [OrganizationService],
  providers: [OrganizationService]
})
export class OrganizationModule {}
