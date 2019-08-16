import { User } from './user/user.entity';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { Organization } from './organization/organization.entity';
import { OrganizationService } from './organization/organization.service';
import { OrganizationModule } from './organization/organization.module';

export { User } from './user/user.entity';
export { UserService } from './user/user.service';
export { UserModule } from './user/user.module';
export { Organization } from './organization/organization.entity';
export { OrganizationService } from './organization/organization.service';
export { OrganizationModule } from './organization/organization.module';

export const Entities = [User, Organization];
export const Services = [UserService, OrganizationService];
export const Modules = [UserModule, OrganizationModule];
