import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Organization } from './organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization) private orgRepo: Repository<Organization>
  ) {}

  async save(organization: Organization) {
    return await this.orgRepo.save(organization);
  }

  async create(name: string, org_id: string, type: string) {
    return await this.orgRepo.save({ name, org_id, type });
  }

  async findById(id: number) {
    return await this.orgRepo.findOne(id);
  }

  async find(query: any) {
    return await this.orgRepo.find(query);
  }

  async findOne(query: any) {
    return await this.orgRepo.findOne(query);
  }

  async findAll() {
    return await this.orgRepo.find();
  }

  async getOrganizationUsers(id: number) {
    const organization = await this.findOne({
      where: { id },
      relations: ['users']
    });
    return organization.users;
  }
}
