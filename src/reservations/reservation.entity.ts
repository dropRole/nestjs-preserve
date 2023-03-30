import { Complaint } from 'src/complaints/complaint.entity';
import { Request } from 'src/requests/request.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: 'NOW' })
  reservedAt: string;

  @Column({ type: 'varchar', length: 10 })
  code: string;

  @OneToOne((_type) => Request, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'idRequests', referencedColumnName: 'id' })
  request: Request;

  @OneToMany((_type) => Complaint, (complaint) => complaint.reservation, {
    eager: true,
  })
  complaints: Complaint[];
}
