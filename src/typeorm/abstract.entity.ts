import {
  PrimaryGeneratedColumn,
  CreateDateColumn
} from 'typeorm';

export abstract class Abstract {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    precision: null,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at: Date;
}
