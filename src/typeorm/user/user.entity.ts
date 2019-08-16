import { Entity, Column, ManyToOne } from 'typeorm';
import { Abstract } from '../abstract.entity';
import { Organization } from '../organization/organization.entity';

@Entity()
export class User extends Abstract {
  @Column()
  role: 'admin' | 'user' | 'super';

  @Column()
  email: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ default: false })
  invited: boolean;

  @Column({ nullable: true })
  invite_token: string;

  @Column({ default: false })
  active: boolean;

  @ManyToOne(_type => Organization, organization => organization.users, {
    cascade: true,
    eager: true
  })
  organization: Organization;

  get isAdmin() {
    return this.role === 'admin';
  }

  get isUser() {
    return this.role === 'user';
  }

  get isSuperAdmin() {
    return this.role === 'super';
  }
}
