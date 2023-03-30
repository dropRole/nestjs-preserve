import { Offeree } from 'src/offerees/offeree.entity';
import { Offeror } from 'src/offerors/offeror.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('prohibitions')
export class Prohibition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: 'NOW' })
  beginning: string;

  @Column({ type: 'timestamp' })
  conclusion: string;

  @Column({ type: 'text' })
  cause: string;

  @ManyToOne((_type) => Offeree, (offeree) => offeree.prohibitions, {
    eager: true,
  })
  @JoinColumn({ name: 'idOfferees', referencedColumnName: 'id' })
  offeree: Offeree;

  @ManyToOne((_type) => Offeror, (offeror) => offeror.prohibitions, {
    eager: true,
  })
  @JoinColumn({ name: 'idOfferors', referencedColumnName: 'id' })
  offeror: Offeror;
}
