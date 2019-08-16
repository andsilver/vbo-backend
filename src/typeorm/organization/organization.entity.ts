import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { Abstract } from '../abstract.entity';
import { User } from '../user/user.entity';

@Entity()
export class Organization extends Abstract {
  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  org_id: string;

  @OneToMany(type => User, user => user.organization)
  users: User[];
}
