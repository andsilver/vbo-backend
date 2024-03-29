import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Organization, Credential } from './organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization) private orgRepo: Repository<Organization>
  ) { }

  async save(organization: Organization) {
    return await this.orgRepo.save(organization);
  }

  async create(name: string, office365_id: string, type: string, exchange_credential: Credential, one_sp_credential: Credential) {
    return await this.orgRepo.save({ name, office365_id, type, exchange_credential, one_sp_credential });
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

  async getExchangeCredential(office365_id: string) {
    const organization = await this.findOne({
      where: { office365_id },
      select: ['exchange_credential']
    });
    return organization.exchange_credential;
  }

  async getSharepointOnedriveCredential(office365_id: string) {
    const organization = await this.findOne({
      where: { office365_id },
      select: ['one_sp_credential']
    });
    return organization.one_sp_credential;
  }
}
