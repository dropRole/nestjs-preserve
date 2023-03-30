import { Account } from 'src/auth/account.entity';
import { Prohibition } from 'src/prohibitions/prohibition.entity';
import { Request } from 'src/requests/request.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('offerors')
export class Offeror {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({ type: 'varchar', length: 60 })
  address: string;

  @Column({ type: 'varchar', length: 15 })
  telephone: string;

  @Column({ type: 'text' })
  businessHours: string;

  @Column({ type: 'smallint', default: 10 })
  @Check('responsiveness BETWEEN 5 AND 10')
  responsiveness: number;

  @Column({ type: 'smallint', default: 10 })
  @Check('compliance BETWEEN 5 AND 10')
  compliance: number;

  @Column({ type: 'smallint', default: 10 })
  @Check('timeliness BETWEEN 5 AND 10')
  timeliness: number;

  @OneToOne((_type) => Account, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  account: Account;

  @OneToMany((_type) => Request, (request) => request.offeror)
  requests: Request[];

  @OneToMany((_type) => Prohibition, (prohibition) => prohibition.offeror)
  prohibitions: Prohibition[];
}
