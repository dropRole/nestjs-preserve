import { Offeree } from 'src/offerees/offeree.entity';
import { Offeror } from 'src/offerors/offeror.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: 'NOW' })
  requestedAt: string;

  @Column({ type: 'timestamp' })
  requestedFor: string;

  @Column({ type: 'timestamp', nullable: true })
  assessment: string;

  @Column({ type: 'smallint' })
  seats: number;

  @Column({ type: 'text' })
  cause: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @ManyToOne((_type) => Offeree, (offeree) => offeree.requests, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'idOfferees', referencedColumnName: 'id' })
  offeree: Offeree;

  @ManyToOne((_type) => Offeror, (offeror) => offeror.requests, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'idOfferors', referencedColumnName: 'id' })
  offeror: Offeror;
}
