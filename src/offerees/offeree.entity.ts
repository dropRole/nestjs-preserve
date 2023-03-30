import { Account } from 'src/auth/account.entity';
import { Prohibition } from 'src/prohibitions/prohibition.entity';
import { Request } from 'src/requests/request.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('offerees')
export class Offeree {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 35 })
  name: string;

  @Column({ type: 'varchar', length: 35 })
  surname: string;

  @Column({ type: 'varchar', length: 320 })
  email: string;

  @OneToOne((_type) => Account, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  account: Account;

  @OneToMany((_type) => Request, (request) => request.offeree)
  requests: Request[];

  @OneToMany((_type) => Prohibition, (prohibition) => prohibition.offeree)
  prohibitions: Prohibition[];
}
