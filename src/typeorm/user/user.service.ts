import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  async save(user: User) {
    return await this.userRepo.save(user);
  }

  async create(
    email: string,
    password: string,
    role: 'admin' | 'user' | 'super'
  ) {
    return await this.userRepo.save({ role, password, email });
  }

  async find(query: any) {
    return await this.userRepo.find(query);
  }

  async findOne(query: any) {
    return await this.userRepo.findOne(query);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: {
        email
      },
      relations: ['organization'],
      select: ['id', 'email', 'password', 'organization', 'role', 'created_at']
    });
  }

  async findAll() {
    return await this.userRepo.find();
  }

  async remove(user: User) {
    return await this.userRepo.remove(user);
  }
}
