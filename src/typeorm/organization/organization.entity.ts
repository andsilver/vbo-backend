import { Entity, Column, OneToMany } from 'typeorm';
import { Abstract } from '../abstract.entity';
import { User } from '../user/user.entity';

export interface Credential {
  userName: string;
  userPassword: string;
}

@Entity()
export class Organization extends Abstract {
  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: false, unique: true })
  office365_id: string;

  @Column({ select: false, nullable: false, type: 'simple-json' })
  exchange_credential: Credential;

  @Column({ select: false, nullable: false, type: 'simple-json' })
  one_sp_credential: Credential;

  @OneToMany(_type => User, user => user.organization)
  users: User[];
}
